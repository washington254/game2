import { useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, Quaternion } from 'three';

export const useControls = (vehicleApi, chassisApi) => {
  let [controls, setControls] = useState({ });
  const [enginePower, setEnginePower] = useState(0);

  useEffect(() => {
    const keyDownPressHandler = (e) => {
      setControls((controls) => ({ ...controls, [e.key.toLowerCase()]: true }));
    }

    const keyUpPressHandler = (e) => {
      setControls((controls) => ({ ...controls, [e.key.toLowerCase()]: false }));
    }
  
    window.addEventListener("keydown", keyDownPressHandler);
    window.addEventListener("keyup", keyUpPressHandler);
    return () => {
      window.removeEventListener("keydown", keyDownPressHandler);
      window.removeEventListener("keyup", keyUpPressHandler);
    }
  }, []);

   useEffect(() => {
    // Set engine power based on some condition or input
    setEnginePower(0.5); // Example: Set engine power to 0.5

    // Clean-up function
    return () => {
      // Reset engine power and any other cleanup if needed
      setEnginePower(0);
    };
  }, []);

     
    // console.log(chassisApi);



  useEffect(() => {
    if(!vehicleApi || !chassisApi) return;

    if (controls.p) {
      vehicleApi.applyEngineForce(150, 2);
      vehicleApi.applyEngineForce(150, 3);
    } else if (controls.l) {
      vehicleApi.applyEngineForce(-150, 2);
      vehicleApi.applyEngineForce(-150, 3);
    } else {
      vehicleApi.applyEngineForce(0, 2);
      vehicleApi.applyEngineForce(0, 3);
    }

    if (controls.o) {
      vehicleApi.setSteeringValue(0.35, 2);
      vehicleApi.setSteeringValue(0.35, 3);
      vehicleApi.setSteeringValue(-0.1, 0);
      vehicleApi.setSteeringValue(-0.1, 1);
    } else if (controls.k) {
      vehicleApi.setSteeringValue(-0.35, 2);
      vehicleApi.setSteeringValue(-0.35, 3);
      vehicleApi.setSteeringValue(0.1, 0);
      vehicleApi.setSteeringValue(0.1, 1);
    } else {
      for(let i = 0; i < 4; i++) {
        vehicleApi.setSteeringValue(0, i);
      }
    }

    if (controls.arrowdown)  chassisApi.applyLocalImpulse([0, -5, 0], [0, 0, +1]);
    if (controls.arrowup)    chassisApi.applyLocalImpulse([0, -5, 0], [0, 0, -1]);
    if (controls.arrowleft)  chassisApi.applyLocalImpulse([0, -5, 0], [-0.5, 0, 0]);
    if (controls.arrowright) chassisApi.applyLocalImpulse([0, -5, 0], [+0.5, 0, 0]);

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


      const keys = {
          'throttle': controls.w,
          'brake': controls.s,
          'pitchUp': controls.q,
          'pitchDown': controls.e,
          'yawLeft': controls.z,
          'yawRight': controls.x,
          'rollLeft': controls.c,
          'rollRight': controls.f,
        }

   
    // Apply control inputs
    if (keys.pitchUp) {
      angularVelocityVector.addScaledVector(right, -0.04 * flightModeInfluence * enginePower);
    }
    if (keys.pitchDown) {
      angularVelocityVector.addScaledVector(right, 0.04 * flightModeInfluence * enginePower);
    }
    if (keys.yawLeft) {
      angularVelocityVector.addScaledVector(up, 0.02 * flightModeInfluence * enginePower);
    }
    if (keys.yawRight) {
      angularVelocityVector.addScaledVector(up, -0.02 * flightModeInfluence * enginePower);
    }
    if (keys.rollLeft) {
      angularVelocityVector.addScaledVector(forward, -0.055 * flightModeInfluence * enginePower);
    }
    if (keys.rollRight) {
      angularVelocityVector.addScaledVector(forward, 0.055 * flightModeInfluence * enginePower);
    }
    if (!keys.pitchUp && !keys.pitchDown && !keys.yawLeft && !keys.yawRight && !keys.rollLeft && !keys.rollRight) {
      // Set force to zero when no keys are pressed
      angularVelocityVector.set(0, 0, 0);
      velocityVector.set(0, 0, 0);
    }

    // Apply thrust
    let speedModifier = keys.throttle && !keys.brake ? 0.06 : keys.brake && !keys.throttle ? -0.05 : 0.02;
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
    

    if (controls.r) {
      chassisApi.position.set(-1.5, 0.5, 3);
      chassisApi.velocity.set(0, 0, 0);
      chassisApi.angularVelocity.set(0, 0, 0);
      chassisApi.rotation.set(0, 0, 0);
    }
  
  }, [controls, enginePower, vehicleApi, chassisApi]);

  return controls;
}