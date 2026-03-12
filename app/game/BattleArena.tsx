'use client';

import { useMemo, useRef, useEffect, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations, ContactShadows, Center } from "@react-three/drei";
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
                        transparent: false,
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

    // Adjust rotations so they face the center of the arena
    // Player is bottom-left (x: -4, z: 4), Center is (0,0,0) -> Facing: +X, -Z
    // Enemy is top-right (x: 4, z: -4), Center is (0,0,0) -> Facing: -X, +Z
    const finalRotationY = facing === 'left' ? -Math.PI / 4 : (3 * Math.PI) / 4;

    return (
        <group scale={modelScale * 0.7} rotation={[0, finalRotationY, 0]}>
            <primitive ref={ref} object={clone} />
        </group>
    );
}

function SceneContent({
    playerUrl,
    playerScale,
    playerAnim,
    enemyUrl,
    enemyScale,
    enemyAnim
}: any) {
    const { viewport, camera } = useThree();
    const isPortrait = viewport.aspect < 1;

    useEffect(() => {
        if (camera instanceof THREE.PerspectiveCamera) {
            camera.fov = isPortrait ? 45 : 35;
            camera.position.set(isPortrait ? 5 : 4, isPortrait ? 8 : 6, isPortrait ? 32 : 26);
            camera.lookAt(0, 0, 5);
            camera.updateProjectionMatrix();
        }
    }, [isPortrait, camera]);

    return (
        <>
            <ambientLight intensity={1.5} />
            <directionalLight position={[10, 15, 10]} intensity={2.5} castShadow shadow-bias={-0.001} />
            <directionalLight position={[-10, 5, -10]} intensity={1.5} />

            {/* The Arena Ground / Platform */}
            <mesh receiveShadow position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[20, 64]} />
                <meshToonMaterial color="#689F38" />
            </mesh>

            {/* Subtle grass darker ring */}
            <mesh receiveShadow position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[22, 64]} />
                <meshToonMaterial color="#558B2F" />
            </mesh>

            {/* Player Position (Bottom Left - moved slightly for portrait) */}
            <group position={[isPortrait ? 4 : 2, 0, 15]}>
                <Suspense fallback={null}>
                    <Model url={playerUrl} modelScale={playerScale} animationName={playerAnim} facing="right" />
                </Suspense>
            </group>

            {/* Enemy Position (Top Right - moved slightly for portrait) */}
            <group position={[isPortrait ? -6 : -10, 0, -5]}>
                <Suspense fallback={null}>
                    <Model url={enemyUrl} modelScale={enemyScale} animationName={enemyAnim} facing="left" />
                </Suspense>
            </group>

            <ContactShadows opacity={0.4} scale={30} blur={2} far={15} color="#000000" />
        </>
    );
}

export default function BattleArena({
    playerUrl,
    playerScale = 1,
    playerAnim = 'idle',
    enemyUrl,
    enemyScale = 1,
    enemyAnim = 'idle'
}: {
    playerUrl: string;
    playerScale?: number;
    playerAnim?: string;
    enemyUrl: string;
    enemyScale?: number;
    enemyAnim?: string;
}) {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <Canvas shadows camera={{ position: [0, 6, 26], fov: 35 }}>
                <SceneContent
                    playerUrl={playerUrl}
                    playerScale={playerScale}
                    playerAnim={playerAnim}
                    enemyUrl={enemyUrl}
                    enemyScale={enemyScale}
                    enemyAnim={enemyAnim}
                />
            </Canvas>
        </div >
    );
}
