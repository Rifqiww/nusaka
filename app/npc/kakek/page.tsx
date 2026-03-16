'use client'

import { useRef, Suspense, useEffect, useState, useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, useTexture, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { useRouter } from 'next/navigation'
import { useJoystickStore } from '../../game/store'
import { useTransitionStore } from '../../store/transitionStore'
import { ChevronRight, Home } from 'lucide-react'
import { SkeletonUtils } from 'three-stdlib'

// Simple direct components for common world elements to bypass Planet LOD for the character page
function SkyBox() {
    const texture = useTexture('/sky.png')
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 3);

    return (
        <mesh scale={2000}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshBasicMaterial map={texture} side={THREE.BackSide} toneMapped={false} />
        </mesh>
    )
}

function SimplePlanet() {
    return (
        <mesh position={[0, -150, 0]} receiveShadow>
            <sphereGeometry args={[150, 64, 64]} />
            <meshToonMaterial color="#8BC34A" />
        </mesh>
    )
}

function PosModel() {
    const { scene } = useGLTF('/model/Pos.glb')
    
    const clone = useMemo(() => {
        const clonedScene = SkeletonUtils.clone(scene)
        clonedScene.traverse((child: any) => {
            if (child.isMesh) {
                const oldMat = child.material as THREE.MeshStandardMaterial;
                child.material = new THREE.MeshToonMaterial({
                    map: oldMat?.map,
                    color: oldMat?.color || '#ffffff',
                    transparent: oldMat?.transparent,
                    opacity: oldMat?.opacity,
                    alphaTest: 0.5,
                    side: THREE.DoubleSide
                });
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        return clonedScene
    }, [scene])

    // Use a group for scaling to avoid mutating the cloned scene root scale directly (safer)
    return (
        <group position={[-6, 0.5, 5]} rotation={[0, Math.PI / 4, 0]} scale={3.5}>
            <primitive object={clone} />
        </group>
    )
}

function DialogNPC({ isTyping }: { isTyping: boolean }) {
    const { scene, animations } = useGLTF('/model/Kakek.glb') as any
    const clone = useMemo(() => {
        const clonedScene = SkeletonUtils.clone(scene)
        clonedScene.traverse((child: any) => {
            if (child.isMesh) {
                const oldMat = child.material as THREE.MeshStandardMaterial;
                child.material = new THREE.MeshToonMaterial({
                    map: oldMat?.map,
                    color: oldMat?.color || '#ffffff',
                    transparent: oldMat?.transparent,
                    opacity: oldMat?.opacity,
                    alphaTest: 0.5,
                    side: THREE.DoubleSide
                });
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        return clonedScene
    }, [scene])

    const { ref, actions, names } = useAnimations(animations, clone)

    useEffect(() => {
        if (!actions) return;
        const talkAnim = names.find((n: string) =>
            n.toLowerCase().includes('talk') ||
            n.toLowerCase().includes('bicara') ||
            n.toLowerCase().includes('speak')
        ) || names[0]

        if (talkAnim && actions[talkAnim]) {
            if (isTyping) {
                actions[talkAnim].reset().fadeIn(0.2).play()
            } else {
                actions[talkAnim].fadeOut(0.5)
            }
        }
    }, [actions, names, isTyping])

    return (
        <group position={[4, 1.2, 10]} rotation={[0, -Math.PI / 8, 0]} scale={2.2}>
            <primitive ref={ref} object={clone} />
        </group>
    )
}

function SceneContent({ isTyping }: { isTyping: boolean }) {
    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        state.camera.position.y = 5 + Math.sin(t * 0.5) * 0.2
        state.camera.lookAt(2, 3, 0)
    })

    return (
        <Suspense fallback={null}>
            <SkyBox />
            <SimplePlanet />
            <ambientLight intensity={1.5} />
            <hemisphereLight args={["#ffffff", "#8BC34A", 1.0]} />
            <directionalLight position={[10, 20, 10]} intensity={2} castShadow />
            <PosModel />
            <DialogNPC isTyping={isTyping} />
        </Suspense>
    )
}

export default function NPCKakekPage() {
    const router = useRouter()
    const playerName = useJoystickStore(s => s.playerName)
    const { startTransition, finishTransition } = useTransitionStore()
    const [dialogStep, setDialogStep] = useState(0)
    const [displayText, setDisplayText] = useState('')
    const [isTyping, setIsTyping] = useState(false)

    const dialogs = [
        `Hai ${playerName || 'Petualang'}!`,
        "Wah, kamu sudah sampai di sini rupanya. Selamat datang di dunia Nusaka!",
        "Dunia ini luas dan penuh dengan keajaiban. Ada banyak hewan-hewan unik yang bisa kamu temukan.",
        "Gunakan Nusadex untuk mencatat setiap pertemuanmu. Itu akan membantumu belajar lebih banyak tentang mereka.",
        "Semoga perjalananmu menyenangkan dan penuh berkah. Sampai jumpa lagi!"
    ]

    // Typewriter Effect
    useEffect(() => {
        let isCancelled = false
        const text = dialogs[dialogStep]
        setDisplayText('')
        setIsTyping(true)

        let currentText = ''
        let index = 0

        const type = () => {
            if (isCancelled) return
            if (index < text.length) {
                currentText += text[index]
                setDisplayText(currentText)
                index++
                setTimeout(type, 35) // Speed of typing
            } else {
                setIsTyping(false)
            }
        }

        type()
        return () => { isCancelled = true }
    }, [dialogStep])

    const handleNext = () => {
        if (isTyping) {
            // Skip typing
            setDisplayText(dialogs[dialogStep])
            setIsTyping(false)
        } else if (dialogStep < dialogs.length - 1) {
            setDialogStep(prev => prev + 1)
        } else {
            handleClose()
        }
    }

    const handleClose = () => {
        startTransition(() => {
            router.push('/')
        })
    }

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-[#87CEEB]">
            {/* Direct 3D Canvas */}
            <div className="absolute inset-0 z-0">
                <Canvas shadows camera={{ position: [0, 5, 25], fov: 25 }}>
                    <SceneContent isTyping={isTyping} />
                </Canvas>
            </div>

            {/* Back Button */}
            <button
                onClick={handleClose}
                className="absolute top-8 left-8 z-50 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all border border-white/20 shadow-lg cursor-pointer"
            >
                <Home size={28} />
            </button>

            {/* Dialogue UI - Full Screen Bottom Style */}
            <div className="absolute bottom-0 left-0 right-0 z-40 animate-fade-in-bottom pointer-events-none">
                <div className="relative w-full flex flex-col justify-end">
                    {/* Character Name Tag */}
                    <div className="relative ml-12">
                        <div
                            style={{ fontFamily: 'var(--font-nanum-pen)' }}
                            className="absolute bottom-full translate-y-1 left-0 px-8 py-3 bg-[#606C38] border-4 border-[#283618] rounded-t-3xl text-3xl font-black text-[#FEFAE0]"
                        >
                            Kakek Nusaka
                        </div>
                    </div>

                    {/* Full Width Dialogue Box - Cream/Paper Theme - Reduced height to avoid covering characters */}
                    <div className="bg-[#FEFAE0] border-t-4 border-[#283618] p-8 md:p-10 md:px-20 relative overflow-hidden pointer-events-auto w-full min-h-[200px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                        {/* Paper Texture Overlay */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")' }} />

                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <p
                                style={{ fontFamily: 'var(--font-nanum-pen)' }}
                                className="text-[#283618] text-5xl md:text-7xl leading-tight"
                            >
                                {displayText}
                                {isTyping && <span className="animate-pulse ml-2 inline-block w-4 h-12 bg-[#283618] vertical-middle" />}
                            </p>

                            <div className="flex justify-end mt-10">
                                <button
                                    onClick={handleNext}
                                    className="group flex items-center gap-6 bg-[#DDA15E] hover:bg-[#BC6C25] border-4 border-[#283618] px-12 py-5 rounded-2xl shadow-[8px_8px_0_#283618] active:translate-y-2 active:shadow-none transition-all cursor-pointer"
                                >
                                    <span style={{ fontFamily: 'var(--font-nanum-pen)' }} className="text-4xl md:text-5xl font-black text-[#FEFAE0]">
                                        {dialogStep === dialogs.length - 1 ? "Selesai" : (isTyping ? "Skip" : "Lanjut")}
                                    </span>
                                    <ChevronRight className="w-10 h-10 md:w-12 md:h-12 text-[#FEFAE0] group-hover:translate-x-2 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fade-in-bottom {
                    from { transform: translateY(100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-fade-in-bottom {
                    animation: fade-in-bottom 0.8s ease-out forwards;
                }
                .vertical-middle {
                    vertical-align: middle;
                }
            `}</style>
        </div>
    )
}
