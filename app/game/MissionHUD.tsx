'use client'

import { useEffect, useState } from 'react'
import { useMissionStore } from './store'
import { Target, CheckCircle2, MapPin, Navigation } from 'lucide-react'
import { auth } from '../../lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export function MissionHUD() {
  const { currentMission, missionStatus, missionObjective, setMission, completeMission } = useMissionStore()
  const [isVisible, setIsVisible] = useState(false)
  const [showNavHint, setShowNavHint] = useState(true)

  // Load mission from Firestore on mount (priority) then fallback to localStorage
  useEffect(() => {
    const loadMission = async () => {
      const user = auth.currentUser
      
      // Try Firestore first if user is logged in
      if (user) {
        try {
          const docRef = doc(db, 'players', user.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            const data = docSnap.data()
            if (data.mission && data.missionStatus) {
              setMission(data.mission, data.missionObjective || '')
              if (data.missionStatus === 'completed') {
                completeMission()
              }
              return // Firestore has mission, use it
            }
          }
        } catch (error) {
          console.error('Error loading mission from Firestore:', error)
        }
      }
      
      // Always check localStorage as fallback or primary source
      const storedMission = localStorage.getItem('current_mission')
      const storedStatus = localStorage.getItem('mission_status') as 'inactive' | 'active' | 'completed'
      const storedObjective = localStorage.getItem('mission_objective')
      
      if (storedMission && storedStatus && storedObjective) {
        setMission(storedMission, storedObjective)
        if (storedStatus === 'completed') {
          completeMission()
        }
        
        // Sync to Firestore if user is logged in and we loaded from localStorage
        if (user) {
          try {
            await updateDoc(doc(db, 'players', user.uid), {
              mission: storedMission,
              missionStatus: storedStatus,
              missionObjective: storedObjective
            })
          } catch (e) {
            console.error('Error syncing mission to Firestore:', e)
          }
        }
      }
    }
    
    loadMission()
  }, [setMission, completeMission])

  // Show HUD when there's an active mission
  useEffect(() => {
    setIsVisible(currentMission !== null && missionStatus === 'active')
  }, [currentMission, missionStatus])

  // Hide navigation hint after 5 seconds
  useEffect(() => {
    if (showNavHint) {
      const timer = setTimeout(() => {
        setShowNavHint(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showNavHint])

  if (!isVisible) return null

  return (
    <>
      {/* Mission Checklist - Top Left */}
      <div className="absolute top-4 left-4 z-50">
        <div className="bg-[#FEFAE0]/95 backdrop-blur-md border-4 border-[#283618] rounded-2xl p-4 shadow-[4px_4px_0_#283618]">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-[#BC6C25] rounded-xl flex items-center justify-center border-3 border-[#283618]" style={{ borderWidth: '3px' }}>
              <Target size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#606C38] uppercase tracking-wider">Misi Aktif</p>
              <p className="text-sm font-bold text-[#283618]">Penjaga Rimba</p>
            </div>
          </div>

          {/* Objective */}
          <div className="bg-[#BC6C25]/10 rounded-xl p-3 border-2 border-[#283618]/20">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-[#BC6C25] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#5C4033] font-medium leading-snug">
                {missionObjective}
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 bg-[#283618]/20 rounded-full overflow-hidden">
              <div className="h-full bg-[#BC6C25] rounded-full animate-pulse" style={{ width: '30%' }} />
            </div>
            <span className="text-xs font-bold text-[#606C38]">Dalam Perjalanan</span>
          </div>
        </div>
      </div>

      {/* Navigation Hint - Shows briefly */}
      {showNavHint && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md rounded-2xl px-6 py-4 text-center animate-fade-in">
            <Navigation size={32} className="text-[#FEFAE0] mx-auto mb-2 animate-bounce" />
            <p className="text-[#FEFAE0] font-bold text-lg">Arahkan ke Hutan Barat</p>
            <p className="text-[#FEFAE0]/70 text-sm">Ikuti kompas untuk menemukan Orang Utan</p>
          </div>
        </div>
      )}

      {/* Distance Indicator - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-50">
        <div className="bg-black/60 backdrop-blur-md rounded-xl px-4 py-2 border-2 border-white/20">
          <div className="flex items-center gap-2">
            <Navigation size={16} className="text-[#10B981]" />
            <span className="text-white font-bold">~450m</span>
            <span className="text-white/60 text-sm">ke target</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, -40%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </>
  )
}

// Mission Complete Overlay
export function MissionCompleteOverlay({ onClose }: { onClose: () => void }) {
  const { missionStatus } = useMissionStore()
  
  if (missionStatus !== 'completed') return null

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#FEFAE0] border-4 border-[#283618] rounded-3xl p-8 max-w-md w-full mx-4 shadow-[8px_8px_0_#283618]">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#10B981] rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-[#283618]">
            <CheckCircle2 size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#283618] mb-2" style={{ fontFamily: 'var(--font-nanum-pen), cursive' }}>
            Misi Selesai!
          </h2>
          <p className="text-[#5C4033] mb-6">
            Kamu berhasil menemukan dan melindungi Orang Utan. Terima kasih telah menjadi penjaga rimba!
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#BC6C25] hover:bg-[#A05A1F] text-[#FEFAE0] font-bold rounded-xl border-4 border-[#283618] transition-all"
          >
            Kembali ke Kakek Nusaka
          </button>
        </div>
      </div>
    </div>
  )
}
