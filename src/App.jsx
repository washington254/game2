import {
  MeshNormalMaterial,
  TorusKnotGeometry,
} from 'three'
import { Canvas } from '@react-three/fiber'
import { Stats, OrbitControls, useGLTF } from '@react-three/drei'
import {
  Debug,
  Physics,
  useBox,
  usePlane,
  useSphere,
  useTrimesh,
  useCylinder,
  useConvexPolyhedron,
} from '@react-three/cannon'
import { useMemo, useRef, Suspense } from 'react'
import { Model } from './Model'
import Character from './Character'
import { Car } from './cars/Car'
import AirPlane from './Plane/Plane'




function Plane(props) {
  const [ref] = usePlane(() => ({ mass: 0, ...props }), useRef())
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial />
    </mesh>
  )
}


function Wall({ args, ...props }) {
  const [ref] = useBox(() => ({
    type: "Static",
    args,
    mass: 0,
    material: {
      friction: 0.3,
      name: "wall",
    },
    collisionFilterGroup: 2,
    ...props,
  }));
  return (
    <mesh receiveShadow ref={ref} {...props}>
      <boxGeometry args={args} />
      <meshPhongMaterial color="white" opacity={0.8} transparent />
    </mesh>
  );
}


function App() {
  
  return (
    <Canvas shadows  frameloop="demand"   
    camera={ {
      fov: 45,
      near: 0.1,
      far: 200,
      position: [ 4, -3, 16 ],
  } }>
      <ambientLight intensity={2}/>
      <spotLight
        position={[2.5, 5, 5]}
        angle={Math.PI / 4}
        penumbra={0.5}
        castShadow
        intensity={Math.PI * 25}
      />
      <spotLight
        position={[-2.5, 5, 5]}
        angle={Math.PI / 4}
        penumbra={0.5}
        castShadow
        intensity={Math.PI * 25}
      />
      <Physics >
        <Debug color={"red"}  >
          <Plane position={[-2, -5, 0]} rotation={[-Math.PI / 2, 0, 0]} />
             
           <Suspense fallback={null}>
               <Model    />
            </Suspense>
            <Suspense fallback={null}>
              {/* <AirPlane/> */}
            </Suspense>
            {/* <Car/> */}
           
           <Suspense fallback={null}>
              {/* <Character/> */}
            </Suspense>
          
            
    
          </Debug>
      </Physics>
      <OrbitControls makeDefault/>
      <Stats />
    </Canvas>
  )
}

export default App;