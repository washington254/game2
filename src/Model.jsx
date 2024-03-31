import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useTrimesh } from '@react-three/cannon';
import { useFrame, useThree } from '@react-three/fiber'; 
import * as THREE from 'three';
import usePlaneControls from './Plane/usePlaneControls';
import { Vector3, Quaternion } from 'three';



const findGeometry = (node) => {
  if (node.isMesh && node.geometry) {
    return node.geometry;
  }

  if (node.children) {
    for (const child of node.children) {
      const geometry = findGeometry(child);
      if (geometry) {
        return geometry;
      }
    }
  }

  return null;
};




export function Model(props) {
  const { scene, nodes, materials } = useGLTF('/plane.glb')


  const geometry = findGeometry(scene);
  const { camera } = useThree();
  const planeRef = useRef(null);
  const [enginePower, setEnginePower] = useState(0);

  useEffect(() => {
    // Set engine power based on some condition or input
    setEnginePower(0.5); // Example: Set engine power to 0.5

    // Clean-up function
    return () => {
      // Reset engine power and any other cleanup if needed
      setEnginePower(0);
    };
  }, []);


  const [ref, api] = useTrimesh(() => ({
    args: [
      geometry.attributes.position.array,
      geometry.index.array,
    ],
    mass: 2,
   
  }), useRef());
  const cameraOffset = new THREE.Vector3(1, 1, 18);
  const cameraSpeed = 0.05; // Adjust this value to your liking. Closer to 1 is faster, closer to 0 is slower.
  
  let [controls, setControls] = useState({ });

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

    const body = api;

    // Extracting quaternion components
    const { x, y, z, w } = body.quaternion;
    const quat = new Quaternion(x, y, z, w);

    // Extracting forward, up, and right vectors from quaternion
    const forward = new Vector3(0, 0, 1).applyQuaternion(quat);
    const up = new Vector3(0, 1, 0).applyQuaternion(quat);
    const right = new Vector3(1, 0, 0).applyQuaternion(quat);

    const velocityVector = new Vector3();
    body.velocity.copy(velocityVector);

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




  useFrame(({clock}) => {
    

    if (planeRef.current) {
      const plane = planeRef.current;

      const relativeCameraOffset = new THREE.Vector3(0, 15, 5);
      const targetCameraPosition = relativeCameraOffset.applyMatrix4(plane.matrixWorld);

      // Use lerp for smooth camera movement.
      camera.position.lerp(targetCameraPosition, cameraSpeed);
      camera.lookAt(plane.position);
    }
 


  });
  

  return (
    <group ref={ref}   {...props} dispose={null}>
      <group ref={planeRef} >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['0_0'].geometry}
          material={materials['ki100_co.paa__ki100.rvmat']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['0_1'].geometry}
          material={materials['glass.paa__glass.rvmat']}
        />
      </group>
    </group>
  )
}

useGLTF.preload('/plane.glb')