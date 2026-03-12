'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Joystick } from 'react-joystick-component'
import { useJoystickStore } from './game/store'
import { useTransitionStore } from './store/transitionStore'
import { auth } from '../lib/firebase'
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Loader2, User as UserIcon, Sword, Volume2, VolumeX } from 'lucide-react'
import { useNotifStore } from "./nusadex/notifStore";
import NusadexPopup from "./nusadex/NusadexPopup";
import { useBattleStore } from './game/battleStore';
import { useCreatureStore } from './nusadex/store';
import BattleUI from './game/BattleUI';
import AudioPlayerControl from '../components/AudioPlayerControl';

const GameScene = dynamic(() => import('./game/GameScene'), { ssr: false })

export default function Home() {
  const router = useRouter()
  const { hasSaveData, playerName, setPlayerProfile, menuState, setMenuState, setNusadexOpen, isAudioMuted, setAudioMuted } = useJoystickStore()
  const { hasNewNotif } = useNotifStore();
  const { startTransition } = useTransitionStore()

  const { nearbyCreature, startBattle } = useBattleStore();
  const { firstPartner } = useCreatureStore();

  // Handle keyboard Interaction "E"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && menuState === 'playing' && nearbyCreature && firstPartner) {
        startBattle(nearbyCreature, firstPartner);
        setMenuState('battle');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuState, nearbyCreature, firstPartner, startBattle, setMenuState]);

  // 1. Check Auth & Save Data on Mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await checkSaveData(user)
      } else {
        try {
          const credentials = await signInAnonymously(auth)
          await checkSaveData(credentials.user)
        } catch (error) {
          console.error('Auth error:', error)
          setMenuState('main')
        }
      }
    })
    return () => unsubscribe()
  }, [])

  const checkSaveData = async (user: User) => {
    let hasSave = false
    try {
      const docRef = doc(db, 'players', user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        setPlayerProfile(user.uid, data.name, true)
        hasSave = true
      } else {
        setPlayerProfile(user.uid, null, false)
      }
    } catch (error) {
      console.error('Firestore error:', error)
    } finally {
      setTimeout(() => {
        useJoystickStore.getState().setMenuState(hasSave ? 'playing' : 'main')
      }, 800)
    }
  }

  // Joystick handlers
  const handleJoystickMove = (e: any) => {
    useJoystickStore.getState().setMovement(e.y, e.x)
  }
  const handleJoystickStop = () => {
    useJoystickStore.getState().setMovement(0, 0)
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#87CEEB]">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0">
        <GameScene />
      </div>

      {/* Main Menu UI Overlay */}
      {menuState !== 'playing' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none bg-transparent backdrop-blur-[6px]">
          <div className="pointer-events-auto w-full flex flex-col items-center justify-center h-full">
            {/* LOGO */}
            <div className="relative w-80 h-36 md:w-[400px] md:h-48 drop-shadow-2xl transition-transform hover:scale-105 duration-300 mb-4">
              <Image src="/Nusaka.svg" alt="Nusaka Logo" fill className="object-contain" priority />
            </div>

            {/* STATE 1: CHECKING DATA */}
            {menuState === 'checking' && (
              <div className="flex flex-col items-center p-8">
                <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
                <p style={{ fontFamily: 'var(--font-nanum-pen)' }} className="text-white text-4xl tracking-wider animate-pulse drop-shadow-md">
                  Memeriksa Data Penjelajah...
                </p>
              </div>
            )}

            {/* STATE 2: MAIN MENU */}
            {menuState === 'main' && (
              <div className="flex flex-col items-center gap-8">
                {hasSaveData ? (
                  <button
                    onClick={() => setMenuState('playing')}
                    className="group flex flex-col items-center transition-all duration-300 hover:scale-110"
                  >
                    <span style={{ fontFamily: 'var(--font-nanum-pen)' }} className="text-white text-6xl md:text-[5rem] drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] hover:text-green-300 transition-colors">
                      Lanjutkan Petualangan!
                    </span>
                    <span style={{ fontFamily: 'var(--font-nanum-pen)' }} className="text-white/80 text-2xl mt-1">
                      Selamat datang kembali, {playerName}!
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => startTransition(() => router.push('/create-character'))}
                    className="group flex flex-col items-center transition-all duration-300 hover:scale-110"
                  >
                    <span style={{ fontFamily: 'var(--font-nanum-pen)' }} className="text-white text-6xl md:text-[5rem]">
                      Buat karakter mu!
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right HUD (ID Card & Nusadex) */}
      <div
        className={`absolute top-6 right-0 md:top-8 md:right-4 z-40 flex flex-col items-end gap-2 md:gap-4 transition-all duration-1000
          ${menuState === 'playing' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-10 pointer-events-none'}`}
      >
        {/* Audio Toggle */}
        <AudioPlayerControl />

        {/* ID Card */}
        <button
          onClick={() => startTransition(() => router.push('/profile'))}
          className="relative w-36 h-20 md:w-52 md:h-28 hover:scale-110 transition-transform cursor-pointer shrink-0 origin-right"
        >
          <Image
            src="/nusadex/Idcard.png"
            alt="ID Card"
            fill
            className="object-contain object-right"
            priority
          />
        </button>

        {/* Nusadex Icon */}
        {menuState === "playing" && (
          <div
            onClick={() => setNusadexOpen(true)}
            className="relative w-28 h-36 md:w-40 md:h-48 hover:scale-[1.05] transition-transform cursor-pointer shrink-0 origin-right"
          >
            <Image
              src="/nusadex/nusadexs.png"
              alt="Nusadex"
              fill
              className="object-contain object-right"
              priority
            />
            {/* Notification Dot */}
            {hasNewNotif && (
              <div className="absolute top-2 right-1 md:top-4 md:right-3 w-5 h-5 md:w-6 md:h-6 bg-red-600 rounded-full border-[3px] border-white animate-pulse" />
            )}
          </div>
        )}
      </div>

      <div
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 z-40 transition-opacity duration-1000 md:hidden
          ${menuState === 'playing' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <Joystick
          size={120}
          sticky={false}
          baseColor="rgba(255,255,255,0.3)"
          stickColor="rgba(255,255,255,0.8)"
          move={handleJoystickMove}
          stop={handleJoystickStop}
        />
      </div>

      {/* Interaction Prompt (E to Battle) */}
      {menuState === 'playing' && nearbyCreature && firstPartner && (
        <div className="absolute bottom-48 md:bottom-12 left-1/2 -translate-x-1/2 z-40 pointer-events-auto animate-bounce w-full sm:w-auto flex justify-center px-6 sm:px-0">
          <button
            onClick={() => {
              startBattle(nearbyCreature, firstPartner);
              setMenuState('battle');
            }}
            className="flex items-center justify-center gap-4 bg-[#FEF08A] hover:bg-[#FDE047] border-4 border-[#374151] w-full max-w-[340px] md:w-auto px-6 py-2 md:px-8 md:py-4 rounded-[24px] md:rounded-[32px] shadow-[6px_6px_0_#374151] md:shadow-[4px_4px_0_#374151] hover:-translate-y-1 transition-transform"
          >
            <Sword className="w-10 h-10 md:w-8 md:h-8 text-[#374151]" strokeWidth={2.5} />
            <div className="flex flex-col items-start leading-none text-[#374151]" style={{ fontFamily: 'var(--font-nanum-pen)' }}>
              <span className="text-3xl md:text-3xl font-black">Lawan {nearbyCreature.name}!</span>
              <span className="text-sm md:text-base font-bold text-[#374151]/70 tracking-widest uppercase">Tekan "E" atau Tap</span>
            </div>
          </button>
        </div>
      )}


      {/* Battle UI Overlay */}
      {menuState === 'battle' && <BattleUI />}

      {/* Nusadex Popup */}
      <NusadexPopup />
    </div>
  );
}
