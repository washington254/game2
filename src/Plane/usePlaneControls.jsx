import { useEffect, useRef } from 'react';
import { Group, Quaternion, Camera } from 'three';
import * as THREE from 'three';

const usePlaneControls = (planeRef, camera) => {
  const planeSpeed = useRef(0.006);
  const maxVelocity = 0.04;
  const acceleration = 0.0008;
  const friction = 0.96;

  const yawVelocity = useRef(0);
  const pitchVelocity = useRef(0);
  const rollVelocity = useRef(0);

  const controls = useRef({});
  const initialRotation = new Quaternion().identity();
  let initialized = false;
  const slerpFactor = 0.01; // Adjust this value for faster or slower auto-correction

  const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  };

  const autoCorrect = (velocityRef) => {
    const slerpFactor = 0.05; // Adjust this value for faster or slower auto-correction

    if (Math.abs(velocityRef.current) < 0.0005) {
      velocityRef.current = 0;
    } else if (velocityRef.current > 0) {
      velocityRef.current -= acceleration * 2; // increased strength
    } else if (velocityRef.current < 0) {
      velocityRef.current += acceleration * 2; // increased strength
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      controls.current[event.key.toLowerCase()] = true;
    };

    const handleKeyUp = (event) => {
      controls.current[event.key.toLowerCase()] = false;
    };
    const MAX_YAW_ACCELERATION = 0.001; // Maximum yaw acceleration. Adjust as needed.
    const MAX_PITCH_ANGLE = THREE.MathUtils.degToRad(45); // 45 degrees in radians for pitch (adjust as needed)
    const MIN_PITCH_ANGLE = -MAX_PITCH_ANGLE;

    const MAX_ROLL_ANGLE = THREE.MathUtils.degToRad(45); // 30 degrees in radians for roll (adjust as needed)
    const MIN_ROLL_ANGLE = -MAX_ROLL_ANGLE;

    const getEulerDeviation = (euler1, euler2) => {
      const dx = euler1.x - euler2.x;
      const dz = euler1.z - euler2.z;
      return Math.sqrt(dx * dx + dz * dz);
    };

    const handleUpdate = () => {
      if (planeRef.current) {
        if (!initialized) {
          initialRotation.copy(planeRef.current.quaternion);
          initialized = true;
        }
        yawVelocity.current *= friction;
        pitchVelocity.current *= friction;
        rollVelocity.current *= friction;

        const yawAcceleration = THREE.MathUtils.clamp(
          THREE.MathUtils.lerp(0.0001, acceleration, Math.abs(planeSpeed.current) / maxVelocity),
          0.0001,
          MAX_YAW_ACCELERATION
        );

        if (controls.current["arrowright"]) {
          yawVelocity.current += yawAcceleration;
        }
        if (controls.current["arrowleft"]) {
          yawVelocity.current -= yawAcceleration;
        }
        if (controls.current["q"]) {
          pitchVelocity.current -= acceleration;
        }
        if (controls.current["e"]) {
          pitchVelocity.current += acceleration;
        }
        if (controls.current["arrowup"]) {
          rollVelocity.current -= acceleration;
        }
        if (controls.current["arrowdown"]) {
          rollVelocity.current += acceleration;
        }

        if (controls.current["w"]) {
          planeSpeed.current += 0.001;
        }
        if (controls.current["s"]) {
          planeSpeed.current -= 0.001;
        }

        yawVelocity.current = clamp(yawVelocity.current, -maxVelocity, maxVelocity);
        pitchVelocity.current = clamp(pitchVelocity.current, -maxVelocity, maxVelocity);
        rollVelocity.current = clamp(rollVelocity.current, -maxVelocity, maxVelocity);
        if (
          !controls.current["q"] &&
          !controls.current["e"] &&
          !controls.current["arrowup"] &&
          !controls.current["arrowdown"]
        ) {
          const currentEuler = new THREE.Euler().setFromQuaternion(planeRef.current.quaternion, 'YXZ');
          const initialEuler = new THREE.Euler().setFromQuaternion(initialRotation, 'YXZ');

          // Check if the pitch is out of bounds
          if (currentEuler.x > MAX_PITCH_ANGLE || currentEuler.x < MIN_PITCH_ANGLE) {
            const targetPitch = currentEuler.x > MAX_PITCH_ANGLE ? MAX_PITCH_ANGLE : MIN_PITCH_ANGLE;
            currentEuler.x += (targetPitch - currentEuler.x) * slerpFactor;
          } else {
            currentEuler.x += (initialEuler.x - currentEuler.x) * slerpFactor;
          }

          // Check if the roll is out of bounds
          if (currentEuler.z > MAX_ROLL_ANGLE || currentEuler.z < MIN_ROLL_ANGLE) {
            const targetRoll = currentEuler.z > MAX_ROLL_ANGLE ? MAX_ROLL_ANGLE : MIN_ROLL_ANGLE;
            currentEuler.z += (targetRoll - currentEuler.z) * slerpFactor;
          } else {
            currentEuler.z += (initialEuler.z - currentEuler.z) * slerpFactor;
          }

          planeRef.current.setRotationFromEuler(currentEuler);
        }

        planeRef.current.rotateY(yawVelocity.current);
        planeRef.current.rotateX(pitchVelocity.current);
        planeRef.current.rotateZ(rollVelocity.current);

        planeRef.current.translateX(planeSpeed.current);
      }

      requestAnimationFrame(handleUpdate);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    handleUpdate();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [planeRef, camera]);

  return {};
};

export default usePlaneControls;
