"use client";

import { useRef, Suspense, useEffect, useState, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { useJoystickStore } from "../../game/store";
import { useTransitionStore } from "../../store/transitionStore";
import { ChevronRight, Home } from "lucide-react";
import { SkeletonUtils } from "three-stdlib";

// Simple direct components for common world elements to bypass Planet LOD for the character page
function SkyBox() {
  const texture = useTexture("/sky.png");
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 3);

  return (
    <mesh scale={2000}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        toneMapped={false}
      />
    </mesh>
  );
}

function SimplePlanet() {
  return (
    <mesh position={[0, -150, 0]} receiveShadow>
      <sphereGeometry args={[150, 64, 64]} />
      <meshToonMaterial color="#8BC34A" />
    </mesh>
  );
}

function PosModel({ isMobile }: { isMobile: boolean }) {
  const { scene } = useGLTF("/model/Pos.glb");

  const clone = useMemo(() => {
    const clonedScene = SkeletonUtils.clone(scene);
    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        const oldMat = child.material as THREE.MeshStandardMaterial;
        child.material = new THREE.MeshToonMaterial({
          map: oldMat?.map,
          color: oldMat?.color || "#ffffff",
          transparent: oldMat?.transparent,
          opacity: oldMat?.opacity,
          alphaTest: 0.5,
          side: THREE.DoubleSide,
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clonedScene;
  }, [scene]);

  // Desktop: left side, bigger. Mobile: closer to center, smaller
  const mobilePos = [-2.5, 1, 17] as [number, number, number];
  const desktopPos = [-5.5, -0.2, 17] as [number, number, number];
  const pos = isMobile ? mobilePos : desktopPos;
  const scale = isMobile ? 2.5 : 3.8;

  return (
    <group position={pos} rotation={[0, Math.PI / 4, 0]} scale={scale}>
      <primitive object={clone} />
    </group>
  );
}

function DialogNPC({
  isTyping,
  isMobile,
}: {
  isTyping: boolean;
  isMobile: boolean;
}) {
  const { scene, animations } = useGLTF("/model/Kakek.glb") as any;
  const clone = useMemo(() => {
    const clonedScene = SkeletonUtils.clone(scene);
    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        const oldMat = child.material as THREE.MeshStandardMaterial;
        child.material = new THREE.MeshToonMaterial({
          map: oldMat?.map,
          color: oldMat?.color || "#ffffff",
          transparent: oldMat?.transparent,
          opacity: oldMat?.opacity,
          alphaTest: 0.5,
          side: THREE.DoubleSide,
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clonedScene;
  }, [scene]);

  const { ref, actions, names } = useAnimations(animations, clone);

  // Desktop: right side, bigger. Mobile: closer to center, smaller
  const mobilePos = [1.5, -0.5, 22] as [number, number, number];
  const desktopPos = [3.5, -1.2, 22] as [number, number, number];
  const pos = isMobile ? mobilePos : desktopPos;
  const scale = isMobile ? 2.5 : 3.5;

  useEffect(() => {
    if (!actions) return;
    const talkAnim =
      names.find(
        (n: string) =>
          n.toLowerCase().includes("talk") ||
          n.toLowerCase().includes("bicara") ||
          n.toLowerCase().includes("speak"),
      ) || names[0];

    if (talkAnim && actions[talkAnim]) {
      if (isTyping) {
        actions[talkAnim].reset().fadeIn(0.2).play();
      } else {
        actions[talkAnim].fadeOut(0.5);
      }
    }
  }, [actions, names, isTyping]);

  return (
    <group position={pos} rotation={[0, -Math.PI / 8, 0]} scale={scale}>
      <primitive ref={ref} object={clone} />
    </group>
  );
}

function SceneContent({
  isTyping,
  isMobile,
}: {
  isTyping: boolean;
  isMobile: boolean;
}) {
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    state.camera.position.y = 4 + Math.sin(t * 0.5) * 0.15;
    // Mobile: look at center so both models are in frame. Desktop: slight right
    state.camera.lookAt(isMobile ? 0 : 1.5, 2.5, 0);
  });

  return (
    <Suspense fallback={null}>
      <SkyBox />
      <SimplePlanet />
      <ambientLight intensity={1.5} />
      <hemisphereLight args={["#ffffff", "#8BC34A", 1.0]} />
      <directionalLight position={[10, 20, 10]} intensity={2} castShadow />
      <PosModel isMobile={isMobile} />
      <DialogNPC isTyping={isTyping} isMobile={isMobile} />
    </Suspense>
  );
}

export default function NPCKakekPage() {
  const router = useRouter();
  const playerName = useJoystickStore((s) => s.playerName);
  const { startTransition, finishTransition } = useTransitionStore();
  const [dialogStep, setDialogStep] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Deteksi mobile berdasarkan lebar layar CSS (bukan unit Three.js)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auto-scroll text container to bottom as new characters are typed
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayText]);

  const dialogs = [
    `Hai ${playerName || "Petualang"}!`,
    "Wah, kamu sudah sampai di sini rupanya. Selamat datang di dunia Nusaka!",
    "Dunia ini luas dan penuh dengan keajaiban. Ada banyak hewan-hewan unik yang bisa kamu temukan.",
    "Gunakan Nusadex untuk mencatat setiap pertemuanmu. Itu akan membantumu belajar lebih banyak tentang mereka.",
    "Semoga perjalananmu menyenangkan dan penuh berkah. Sampai jumpa lagi!",
  ];

  // Typewriter Effect
  useEffect(() => {
    let isCancelled = false;
    const text = dialogs[dialogStep];
    setDisplayText("");
    setIsTyping(true);

    let currentText = "";
    let index = 0;

    const type = () => {
      if (isCancelled) return;
      if (index < text.length) {
        currentText += text[index];
        setDisplayText(currentText);
        index++;
        setTimeout(type, 35); // Speed of typing
      } else {
        setIsTyping(false);
      }
    };

    type();
    return () => {
      isCancelled = true;
    };
  }, [dialogStep]);

  const handleNext = () => {
    if (isTyping) {
      // Skip typing
      setDisplayText(dialogs[dialogStep]);
      setIsTyping(false);
    } else if (dialogStep < dialogs.length - 1) {
      setDialogStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    startTransition(() => {
      router.push("/");
    });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#87CEEB]">
      {/* 3D Canvas - limited to upper portion so characters always stay visible above dialog */}
      <div
        className="absolute inset-0 z-0"
        style={{ bottom: "clamp(160px, 30vh, 260px)" }}
      >
        {/* Desktop and mobile use different FOV via canvas */}
        <Canvas shadows camera={{ position: [0, 4, 32], fov: 30 }}>
          <SceneContent isTyping={isTyping} isMobile={isMobile} />
        </Canvas>
      </div>

      {/* Home Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 sm:top-8 left-4 sm:left-8 z-50 p-2.5 sm:p-4 bg-[#87CEEB]/80 hover:bg-[#87CEEB] backdrop-blur-md rounded-full text-[#283618] transition-all duration-300 shadow-[1px_3px_6px_rgba(40,54,24,0.3)] active:shadow-none cursor-pointer group"
      >
        <Home
          size={22}
          className="sm:hidden group-hover:scale-110 transition-transform"
        />
        <Home
          size={28}
          className="hidden sm:block group-hover:scale-110 transition-transform"
        />
      </button>

      {/* Dialogue UI — fixed at bottom, limited height */}
      <div className="absolute bottom-0 left-0 right-0 z-40 animate-fade-in-bottom pointer-events-none">
        <div className="relative w-full flex flex-col justify-end">
          {/* Character Name Tag */}
          <div className="relative ml-4 sm:ml-12">
            <div
              style={{ fontFamily: "var(--font-nanum-pen)" }}
              className="absolute bottom-full translate-y-1 left-0 px-4 sm:px-8 py-2 sm:py-3 bg-[#606C38] border-4 border-[#283618] rounded-t-3xl text-xl sm:text-3xl font-black text-[#FEFAE0] whitespace-nowrap"
            >
              Kakek Nusaka
            </div>
          </div>

          {/* Dialog Box — fixed height, scrollable text */}
          <div
            className="bg-[#FEFAE0] border-t-4 border-[#283618] px-5 sm:px-10 md:px-20 pt-5 sm:pt-6 pb-4 sm:pb-5 relative pointer-events-auto w-full shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
            style={{ height: "clamp(160px, 30vh, 260px)" }}
          >
            {/* Paper texture */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply"
              style={{
                backgroundImage:
                  'url("https://www.transparenttextures.com/patterns/paper-fibers.png")',
              }}
            />

            <div className="relative z-10 flex flex-col h-full gap-3">
              {/* Scrollable text area — takes remaining space, auto-scrolls */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto scrollbar-none pr-1"
              >
                <p
                  style={{ fontFamily: "var(--font-nanum-pen)" }}
                  className="text-[#283618] text-2xl sm:text-4xl md:text-5xl leading-snug"
                >
                  {displayText}
                  {isTyping && (
                    <span className="animate-pulse ml-2 inline-block w-3 h-7 sm:w-4 sm:h-10 bg-[#283618] align-middle" />
                  )}
                </p>
              </div>

              {/* Button row — always at bottom */}
              <div className="flex justify-end shrink-0">
                <button
                  onClick={handleNext}
                  className="group flex items-center gap-3 sm:gap-6 bg-[#DDA15E] hover:bg-[#BC6C25] border-4 border-[#283618] px-5 sm:px-8 py-2 sm:py-3 rounded-2xl shadow-[6px_6px_0_#283618] sm:shadow-[8px_8px_0_#283618] active:translate-y-2 active:shadow-none transition-all cursor-pointer"
                >
                  <span
                    style={{ fontFamily: "var(--font-nanum-pen)" }}
                    className="text-2xl sm:text-3xl md:text-4xl font-black text-[#FEFAE0]"
                  >
                    {dialogStep === dialogs.length - 1
                      ? "Selesai"
                      : isTyping
                        ? "Skip"
                        : "Lanjut"}
                  </span>
                  <ChevronRight className="w-7 h-7 sm:w-10 sm:h-10 text-[#FEFAE0] group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in-bottom {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fade-in-bottom {
          animation: fade-in-bottom 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
