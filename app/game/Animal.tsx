import React, { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'

interface AnimalProps {
    path: string
    position: THREE.Vector3
    normal: THREE.Vector3
    rotationY: number
    scale?: number
}

// Shared LOD system: instead of 45 separate useFrame callbacks,
// we use a single interval. We also PAUSE skeletal animations when out of view.
const _frustum = new THREE.Frustum();
const _projScreenMatrix = new THREE.Matrix4();
const _animalSphere = new THREE.Sphere(new THREE.Vector3(), 5);

// Shared state to avoid recalculating frustum 45+ times per frame
let lastFrustumFrame = -1;
function updateSharedFrustum(camera: THREE.Camera, clock: THREE.Clock) {
    const frame = clock.getElapsedTime();
    if (lastFrustumFrame === frame) return;
    lastFrustumFrame = frame;
    camera.updateMatrixWorld();
    _projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    _frustum.setFromProjectionMatrix(_projScreenMatrix);
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

    const { ref, actions, names, mixer } = useAnimations(animations)
    const groupRef = useRef<THREE.Group>(null)

    // Per-frame LOD check - balanced distance for performance
    const renderDist = 200;

    useFrame((state) => {
        if (!groupRef.current) return;

        // Ensure frustum is updated for this frame
        updateSharedFrustum(state.camera, state.clock);

        const distSq = state.camera.position.distanceToSquared(position);
        
        // Render loop for Frustum + Near-field check
        let isVisible = false;
        if (distSq < renderDist * renderDist) {
            // Near-field always visible (for shadows/peripherals)
            if (distSq < 60 * 60) {
                isVisible = true;
            } else {
                // Check if inside camera view
                _animalSphere.center.copy(position);
                _animalSphere.radius = scale * 5.0; // Margin to prevent popping
                isVisible = _frustum.intersectsSphere(_animalSphere);
            }
        }

        if (groupRef.current.visible !== isVisible) {
            groupRef.current.visible = isVisible;
            if (mixer) mixer.timeScale = isVisible ? 1 : 0;
        }
    }, 10);

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
