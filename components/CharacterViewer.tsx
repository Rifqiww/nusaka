'use client';

import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

function Model() {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/model/nasaka.glb') as any;
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        const old = child.material as THREE.MeshStandardMaterial;
        const mat = new THREE.MeshToonMaterial({
          map: old.map,
          color: old.color,
          transparent: false,
          alphaTest: 0.5,
          side: THREE.DoubleSide,
        });
        if (mat.map) {
          mat.map.generateMipmaps = false;
          mat.map.minFilter = THREE.NearestFilter;
          mat.map.magFilter = THREE.NearestFilter;
          mat.map.needsUpdate = true;
        }
        child.material = mat;
      }
    });
  }, [scene]);

  useEffect(() => {
    const idleKey = Object.keys(actions).find((k) => k.toLowerCase().includes('idle'));
    if (idleKey) actions[idleKey]?.reset().fadeIn(0.4).play();
  }, [actions]);

  return (
    <group ref={group}>
      <primitive object={scene} scale={2.8} />
    </group>
  );
}

const CharacterViewer = () => {
  return (
    <div className="w-full h-[250px] md:h-[300px] lg:h-[380px] relative bg-[#E0F2FE]">
      <div className="w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 1.5, 7], fov: 45 }}>
          <Suspense fallback={null}>
            <Environment preset="city" />

            <group position={[0, -2.5, 0]}>
              <Model />
            </group>

            <OrbitControls
              enableZoom={true}
              enablePan={false}
              minDistance={3}
              maxDistance={12}
              maxPolarAngle={Math.PI / 2 + 0.1}
              target={[0, 0, 0]}
              makeDefault
              autoRotate
              autoRotateSpeed={0.5}
            />
          </Suspense>
          <ambientLight intensity={2} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
        </Canvas>
      </div>

      <div className="absolute bottom-4 right-4 text-center pointer-events-none">
        <span className="bg-white text-[#374151] border-[4px] border-[#374151] text-xl font-bold uppercase tracking-widest px-4 py-2 rounded-xl">
          Putar ↺
        </span>
      </div>
    </div>
  );
};

export default CharacterViewer;
