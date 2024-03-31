import { useFrame } from '@react-three/fiber';
import { useEffect } from 'react';
import { Vector3, Quaternion } from 'three';

export const usePhysicsPreStep = (chassisApi, controls, enginePower) => {
  useEffect(() => {
    
    if (!chassisApi) return;
 
    const body = chassisApi;

    // Extracting quaternion components
    const { x, y, z, w } = body.quaternion;
    const quat = new Quaternion(x, y, z, w);

    // Extracting forward, up, and right vectors from quaternion
    const forward = new Vector3(0, 0, 1).applyQuaternion(quat);
    const up = new Vector3(0, 1, 0).applyQuaternion(quat);
    const right = new Vector3(1, 0, 0).applyQuaternion(quat);

    const velocityVector = new Vector3();
    chassisApi.velocity.copy(velocityVector);
  
    // Calculate current speed
    const currentSpeed = velocityVector.dot(forward);

    // Rotation controls influence
    let flightModeInfluence = Math.min(Math.max(currentSpeed / 10, 0), 1);

    // Apply rotation stabilization
      // Get the angular velocity vector using the copy method
    const angularVelocityVector = new Vector3();
    body.angularVelocity.copy(angularVelocityVector);

    // Apply the multiplyScalar method to the angular velocity vector
    angularVelocityVector.multiplyScalar(0.98);

    // Set the updated angular velocity vector back to the body
    body.angularVelocity.set(angularVelocityVector.x, angularVelocityVector.y, angularVelocityVector.z);


    // Apply control inputs
    if (controls.pitchUp) {
      angularVelocityVector.addScaledVector(right, -0.04 * flightModeInfluence * enginePower);
    }
    if (controls.pitchDown) {
      angularVelocityVector.addScaledVector(right, 0.04 * flightModeInfluence * enginePower);
    }
    if (controls.yawLeft) {
      angularVelocityVector.addScaledVector(up, 0.02 * flightModeInfluence * enginePower);
    }
    if (controls.yawRight) {
      angularVelocityVector.addScaledVector(up, -0.02 * flightModeInfluence * enginePower);
    }
    if (controls.rollLeft) {
      angularVelocityVector.addScaledVector(forward, -0.055 * flightModeInfluence * enginePower);
    }
    if (controls.rollRight) {
      angularVelocityVector.addScaledVector(forward, 0.055 * flightModeInfluence * enginePower);
    }

    // Apply thrust
    let speedModifier = controls.throttle && !controls.brake ? 0.06 : controls.brake && !controls.throttle ? -0.05 : 0.02;
    velocityVector.addScaledVector(forward, (speedModifier + 0.003) * enginePower);

    // Apply drag
    const drag = Math.pow(velocityVector.length(), 1) * 0.003 * enginePower;
    velocityVector.multiplyScalar(1 - drag);

    // Apply lift
    let lift = Math.pow(velocityVector.length(), 1) * 0.005 * enginePower;
    lift = Math.min(Math.max(lift, 0), 0.05);
    velocityVector.addScaledVector(up, lift);

    // Apply damping
    angularVelocityVector.multiplyScalar(0.98);

    // Clean-up function
    return () => {
      angularVelocityVector.set(0, 0, 0);
      velocityVector.set(0, 0, 0);
    };
  }, [chassisApi, controls, enginePower]);
};
