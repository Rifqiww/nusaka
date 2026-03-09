'use client';

import { useMemo, useRef, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, Center, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

function Model({
    url,
    modelScale = 1,
    animationName = 'idle',
    facing = 'right',
}: {
    url: string;
    modelScale?: number;
    animationName?: string;
    facing?: 'left' | 'right';
}) {
    const { scene, animations } = useGLTF(url) as any;
    const { ref, actions, names } = useAnimations(animations);

    const clone = useMemo(() => {
        const clonedScene = SkeletonUtils.clone(scene);
        clonedScene.traverse((node: any) => {
            node.visible = true;
            if (node.isMesh) {
                const oldMat = node.material as THREE.MeshStandardMaterial;
                if (oldMat) {
                    const newMat = new THREE.MeshToonMaterial({
                        map: oldMat.map,
                        color: oldMat.color,
                        transparent: false, // Ensure no depth sorting issues
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

    const currentActionRef = useRef<THREE.AnimationAction | null>(null);

    useEffect(() => {
        if (!names.length) return;

        let targetName = names[0];
        const matchAnim = (keyword: string) => names.find((n: string) => n.toLowerCase().includes(keyword));

        if (animationName === 'attack') {
            targetName = matchAnim('Attack') || matchAnim('attack') || matchAnim('bite') || matchAnim('Bite') || matchAnim('strike') || matchAnim('Strike') || names[0];
        } else if (animationName === 'hit') {
            targetName = matchAnim('Hit') || matchAnim('hit') || matchAnim('damage') || matchAnim('Damage') || matchAnim('hurt') || matchAnim('Hurt') || names[0];
        } else if (animationName === 'walk') {
            targetName = matchAnim('Walk') || matchAnim('walk') || matchAnim('run') || matchAnim('Run') || matchAnim('move') || matchAnim('Move') || names[0];
        } else {
            targetName = matchAnim('Idle') || matchAnim('idle') || names[0];
        }

        const action = actions[targetName];
        if (action) {
            action.reset().fadeIn(0.2).play();

            if (animationName === 'attack' || animationName === 'hit') {
                action.setLoop(THREE.LoopOnce, 1);
                action.clampWhenFinished = true;
            } else {
                action.setLoop(THREE.LoopRepeat, Infinity);
                action.clampWhenFinished = false;
            }

            if (currentActionRef.current && currentActionRef.current !== action) {
                currentActionRef.current.fadeOut(0.2);
            }
            currentActionRef.current = action;
        }

    }, [actions, names, animationName]);

    // Determine fixed angles so they face each other rather than the camera directly
    // 'left' -> Enemy facing down-left (-X, +Z)
    // 'right' -> Player facing up-right (+X, -Z)
    const finalRotationY = facing === 'left' ? -Math.PI / 4 : (3 * Math.PI) / 4;

    return (
        <group scale={modelScale * 1.5} rotation={[0, finalRotationY, 0]}>
            <primitive ref={ref} object={clone} />
        </group>
    );
}

export default function BattleCreature3D({
    modelUrl,
    scale = 1,
    animationName = 'idle',
    facing = 'right'
}: {
    modelUrl: string;
    scale?: number;
    animationName?: string;
    facing?: 'left' | 'right';
}) {
    return (
        <div className="w-full h-full relative" style={{ background: 'transparent' }}>
            <Canvas shadows camera={{ position: [0, 2, 10], fov: 35 }}>
                {/* Transparent by default */}
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 10, 10]} intensity={2.5} castShadow />
                <directionalLight position={[-10, 5, -10]} intensity={1.5} />

                <Center position={[0, -1.5, 0]}>
                    <Suspense fallback={null}>
                        <Model url={modelUrl} modelScale={scale} animationName={animationName} facing={facing} />
                    </Suspense>
                </Center>
            </Canvas>
        </div>
    );
}
