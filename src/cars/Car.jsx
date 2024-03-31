import { useCompoundBody, useRaycastVehicle } from "@react-three/cannon";
import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useRef, useMemo } from "react";
import { Quaternion, Vector3 } from "three";
import { useControls } from "./useControls";
import { useWheels } from "./useWheels";
import { WheelDebug } from "./WheelDebug";
import { useGLTF } from "@react-three/drei";

export function Car() {
 

  
  const width = 0.15;
  const height = 0.07;
  const front = 0.15;
  const wheelRadius = 0.05;

  const wingWidth = 0.40; // Adjust width as needed
  const wingHeight = 0.03;  // Adjust height as needed
  const wingDepth = 0.1;  // Adjust depth (thickness) as needed

  const tailVerticalWidth = 0.04; // Adjust width as needed
  const tailVerticalHeight = 0.2;  // Adjust height as needed
  const tailVerticalDepth = 0.04;  // Adjust depth (thickness) as needed

  const tailHorizontalWidth = 0.2; // Adjust width as needed
  const tailHorizontalHeight = 0.03;  // Adjust height as needed
  const tailHorizontalDepth = 0.04;  // Adjust depth (thickness) as needed

  const chassisBodyArgs = [width, height, front * 2];
  const tailVerticalPosition = [0, tailVerticalHeight / 2, front]; // Move the tail vertical to the back
  const tailHorizontalPosition = [0, tailVerticalHeight, front + tailVerticalDepth / 2]; // Move the tail horizontal to the back of the vertical tail
  
  const [chassisBody, chassisApi] = useCompoundBody(() => ({
    mass: 150,
    position: [-1.5, 0.5, 3],
    shapes: [
      { type: "Box", args: chassisBodyArgs }, // Chassis body shape
      { type: "Box", args: [wingWidth, wingHeight, wingDepth], position: [-wingWidth / 2, wingHeight / 2, 0] }, // Left wing shape
      { type: "Box", args: [wingWidth, wingHeight, wingDepth], position: [wingWidth / 2, wingHeight / 2, 0] }, // Right wing shape
      { type: "Box", args: [tailVerticalWidth, tailVerticalHeight, tailVerticalDepth], position: tailVerticalPosition }, // Tail vertical shape
      { type: "Box", args: [tailHorizontalWidth, tailHorizontalHeight, tailHorizontalDepth], position: tailHorizontalPosition }, // Tail horizontal shape
    ],
  }));
  

  const [wheels, wheelInfos] = useWheels(width, height, front, wheelRadius);

  const [vehicle, vehicleApi] = useRaycastVehicle(
    () => ({
      chassisBody,
      wheelInfos,
      wheels,
    }),
    useRef(null),
  );

  useControls(vehicleApi, chassisApi);

  useFrame((state) => {

    let position = new Vector3(0,0,0);
    position.setFromMatrixPosition(chassisBody.current.matrixWorld);

    let quaternion = new Quaternion(0, 0, 0, 0);
    quaternion.setFromRotationMatrix(chassisBody.current.matrixWorld);

    let wDir = new Vector3(0,0,1);
    wDir.applyQuaternion(quaternion);
    wDir.normalize();

    let cameraPosition = position.clone().add(wDir.clone().multiplyScalar(1).add(new Vector3(0, 0.3, 0)));
    
    wDir.add(new Vector3(0, 0.2, 0));
    state.camera.position.copy(cameraPosition);
    state.camera.lookAt(position);
  });
 

  return (
    <group ref={vehicle} name="vehicle">
      
      <mesh ref={chassisBody}>
        <meshBasicMaterial transparent={true} color={"red"} opacity={0.9} />
        <boxGeometry args={chassisBodyArgs} />
      </mesh>

      <WheelDebug wheelRef={wheels[0]} radius={wheelRadius} />
      <WheelDebug wheelRef={wheels[1]} radius={wheelRadius} />
      <WheelDebug wheelRef={wheels[2]} radius={wheelRadius} />
      <WheelDebug wheelRef={wheels[3]} radius={wheelRadius} />
    </group>
  );
}
