import React, { Suspense } from "react";
import ThirdPersonCharacterControls from "./character/index";

import { useFBX } from "@react-three/drei";

const animationPaths = {
  idle: `/Idle.fbx`,
  walk: `/Walking.fbx`,
  run: `/Running.fbx`,
  jump: `/Jump.fbx`,
  landing: `/Landing.fbx`,
  inAir: `/Falling Idle.fbx`,
  backpedal: `/Walking Backward.fbx`,
  turnLeft: `/Left Turn.fbx`,
  turnRight: `/Right Turn.fbx`,
  strafeLeft: `/Left Strafe.fbx`,
  strafeRight: `/Right Strafe.fbx`,
};

function Character() {
  const characterObj = useFBX(`/manequin.fbx`);
  const characterProps = {
    scale: 0.03,
    velocity: 8,
    radius: 0.5,
  };
  return (
    <ThirdPersonCharacterControls
      cameraOptions={{
        yOffset: 2.6,
        minDistance: 10.6,
        maxDistance: 70,
        collisionFilterMask: 2,
      }}
      characterObj={characterObj}
      animationPaths={animationPaths}
      characterProps={characterProps}
    />
  );
}

export default Character;


