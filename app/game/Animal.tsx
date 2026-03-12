import React, { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'

interface AnimalProps {
    path: string
    position: THREE.Vector3
    normal: THREE.Vector3
    rotationY: number
    scale?: number
}

// Shared LOD system: instead of 45 separate useFrame callbacks (one per animal),
// we use a single interval + IntersectionObserver-style approach.
// Each animal registers itself and gets updated from a centralized timer.
const lodRegistry = new Map<THREE.Group, THREE.Vector3>();

// A module-level interval updates all animal visibility at 5 fps max
// This replaces 45x useFrame subscriptions with a single lightweight timer
let lodInterval: ReturnType<typeof setInterval> | null = null;
let registeredCamera: THREE.Camera | null = null;
const LOD_INTERVAL_MS = 200; // 5fps is fine for LOD decisions
const RENDER_DIST_SQ = 150 * 150;

function startLodSystem() {
    if (lodInterval) return;
    lodInterval = setInterval(() => {
        if (!registeredCamera) return;
        lodRegistry.forEach((position, groupRef) => {
            const distSq = registeredCamera!.position.distanceToSquared(position);
            groupRef.visible = distSq < RENDER_DIST_SQ;
        });
    }, LOD_INTERVAL_MS);
}

export function Animal({ path, position, normal, rotationY, scale = 1 }: AnimalProps) {
    const { scene, animations } = useGLTF(path) as any
    const clone = useMemo(() => {
        const clonedScene = SkeletonUtils.clone(scene)
        clonedScene.traverse((node: any) => {
            if (node.isMesh) {
                const oldMat = node.material as THREE.MeshStandardMaterial;
                if (oldMat) {
                    const newMat = new THREE.MeshToonMaterial({
                        map: oldMat.map,
                        color: oldMat.color,
                        transparent: oldMat.transparent,
                        opacity: oldMat.opacity,
                        alphaTest: 0.5,
                        side: THREE.DoubleSide
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
        return clonedScene
    }, [scene])

    const { ref, actions, names } = useAnimations(animations)
    const groupRef = useRef<THREE.Group>(null)
    const { camera } = useThree()

    // Register with centralized LOD system (replaces per-animal useFrame)
    useEffect(() => {
        registeredCamera = camera;
        if (groupRef.current) {
            lodRegistry.set(groupRef.current, position);
        }
        startLodSystem();

        return () => {
            if (groupRef.current) {
                lodRegistry.delete(groupRef.current);
            }
            // Stop interval when no animals remain
            if (lodRegistry.size === 0 && lodInterval) {
                clearInterval(lodInterval);
                lodInterval = null;
            }
        };
    }, [camera, position]);

    useEffect(() => {
        if (names.length > 0 && Math.random() < 0.05) {
            console.log(`Animations for ${path}:`, names);
        }

        const actionName = names.find((n: string) => n.toLowerCase().includes('idle')) || names[0]
        if (actionName && actions[actionName]) {
            actions[actionName]?.reset().fadeIn(0.5).play()
        }
        return () => {
            if (actionName && actions[actionName]) {
                actions[actionName]?.fadeOut(0.5)
            }
        }
    }, [actions, names, path])

    const quaternion = useMemo(() => {
        const q = new THREE.Quaternion()
        q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)
        return q
    }, [normal])

    return (
        <group ref={groupRef} position={position} quaternion={quaternion}>
            <group rotation-y={rotationY} scale={scale}>
                <primitive ref={ref} object={clone} />
            </group>
        </group>
    )
}
