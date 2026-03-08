"use client";

import { useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Center, Environment, useAnimations, OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

function Model({
  url,
  autoRotate = true,
  modelScale = 1,
  position = [0, 0, 0],
}: {
  url: string;
  autoRotate?: boolean;
  modelScale?: number;
  position?: [number, number, number];
}) {
  const { scene, animations } = useGLTF(url) as any;
  const { ref, actions, names } = useAnimations(animations);

  const clone = useMemo(() => {
    const clonedScene = SkeletonUtils.clone(scene);
    clonedScene.traverse((node: any) => {
      // Ensure all nodes are visible
      node.visible = true;
      if (node.isMesh) {
        const oldMat = node.material as THREE.MeshStandardMaterial;
        if (oldMat) {
          const newMat = new THREE.MeshToonMaterial({
            map: oldMat.map,
            color: oldMat.color,
            transparent: oldMat.transparent,
            opacity: oldMat.opacity,
            alphaTest: 0.5,
            side: THREE.DoubleSide,
          });

          if (newMat.map) {
            newMat.map.generateMipmaps = false;
            newMat.map.minFilter = THREE.NearestFilter;
            newMat.map.magFilter = THREE.NearestFilter;
            newMat.map.anisotropy = 1;
            newMat.map.needsUpdate = true;
          }
          node.material = newMat;
          node.castShadow = true;
          node.receiveShadow = true;
        }
      }
    });
    return clonedScene;
  }, [scene]);

  useEffect(() => {
    const actionName = names.find((n: string) => n.toLowerCase().includes('idle')) || names[0];
    if (actionName && actions[actionName]) {
      actions[actionName]?.reset().fadeIn(0.5).play();
    }
    return () => {
      if (actionName && actions[actionName]) {
        actions[actionName]?.fadeOut(0.5);
      }
    };
  }, [actions, names, url]);

  return (
    <group scale={modelScale} position={position}>
      <primitive ref={ref} object={clone} />
    </group>
  );
}

export default function Creature3D({
  modelUrl,
  autoRotate = true,
  scale = 1,
  position = [0, 0, 0],
}: {
  modelUrl: string;
  autoRotate?: boolean;
  scale?: number;
  position?: [number, number, number];
}) {
  return (
    <div className="w-full h-full min-h-[200px] cursor-grab active:cursor-grabbing">
      <Canvas shadows camera={{ position: [0, 2, 8], fov: 35 }}>
        <color attach="background" args={["transparent"]} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={autoRotate}
          autoRotateSpeed={4}
          makeDefault
        />

        <Environment preset="city" />
        <ambientLight intensity={2.5} />
        <directionalLight position={[10, 15, 10]} intensity={3} castShadow />
        <directionalLight position={[-10, 10, -10]} intensity={2} />

        <group scale={scale} position={position}>
          <Center bottom>
            <Model url={modelUrl} autoRotate={autoRotate} />
          </Center>
        </group>

        <ContactShadows
          opacity={0.4}
          scale={25}
          blur={2.5}
          far={15}
          resolution={512}
          color="#000000"
        />
      </Canvas>
    </div>
  );
} // Preload models for faster first-time rendering
useGLTF.preload("/model/rajawali.glb");
useGLTF.preload("/model/komodo.glb");
useGLTF.preload("/model/OrangUtan.glb");

