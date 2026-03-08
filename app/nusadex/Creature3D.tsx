"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Center, Environment } from "@react-three/drei";
import * as THREE from "three";

function Model({
  url,
  autoRotate = true,
}: {
  url: string;
  autoRotate?: boolean;
}) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    if (autoRotate && ref.current) {
      // Horizontal rotation
      ref.current.rotation.y += delta * 0.8;
    }
  });

  return <primitive object={scene} ref={ref} />;
}

export default function Creature3D({
  modelUrl,
  autoRotate = true,
}: {
  modelUrl: string;
  autoRotate?: boolean;
}) {
  return (
    <div className="w-full h-full min-h-[150px] pointer-events-none">
      <Canvas shadows camera={{ position: [0, 0, 25], fov: 25 }}>
        <color attach="background" args={["transparent"]} />

        {/* Environment map is key for PBR materials to not appear black */}
        <Environment preset="city" />

        <ambientLight intensity={1} />

        {/* Front Main Light */}
        <directionalLight
          position={[5, 5, 5]}
          intensity={2}
          castShadow
          shadow-mapSize={1024}
        />

        {/* Fill Light from back/side */}
        <directionalLight position={[-5, 5, -5]} intensity={1} />

        {/* Bottom Fill */}
        <pointLight position={[0, -5, 5]} intensity={0.5} />

        <Center>
          <Model url={modelUrl} autoRotate={autoRotate} />
        </Center>
      </Canvas>
    </div>
  );
} // Preload models for faster first-time rendering
useGLTF.preload("/model/rajawali.glb");
useGLTF.preload("/model/Komodo.glb");
useGLTF.preload("/model/OrangUtan.glb");
