'use client'

import { useJoystickStore } from '../app/game/store'
import { useCreatureStore } from '../app/nusadex/store'
import { User, Play, Plus, PawPrint, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransitionStore } from '../app/store/transitionStore'

const elementBg: Record<string, string> = {
    Angin: 'bg-[#BAE6FD]',
    Tanah: 'bg-[#D9F5D0]',
    Air: 'bg-[#BFDBFE]',
}

export default function CharacterSelectionOverlay() {
    const { playerName, setMenuState } = useJoystickStore()
    const { firstPartner } = useCreatureStore()
    const router = useRouter()
    const { startTransition, finishTransition } = useTransitionStore()

    const handleLogout = async () => {
        const { auth } = await import('../lib/firebase');
        await auth.signOut();
        setMenuState('auth');
        useCreatureStore.getState().reset();
    }

    const handleEnterGame = () => {
        startTransition(() => {
            setMenuState('playing');
            setTimeout(() => {
                finishTransition();
            }, 800);
        });
    }

    const cardBg = firstPartner ? (elementBg[firstPartner.element] || 'bg-[#FEF08A]') : 'bg-[#FEF08A]'

    return (
        <div className="flex flex-col items-center gap-10 animate-in fade-in zoom-in duration-700 pointer-events-auto max-w-2xl w-full" style={{ fontFamily: 'var(--font-nanum-pen)' }}>
            <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-4">
                    <div className="h-[2px] w-12 bg-[#374151]/20" />
                    <Sparkles className="text-[#D97706] w-8 h-8 md:w-10 md:h-10 animate-pulse" />
                    <div className="h-[2px] w-12 bg-[#374151]/20" />
                </div>
                <h2 className="text-7xl md:text-9xl text-[#374151] drop-shadow-[4px_4px_0_rgba(255,255,255,0.8)]">
                    Pilih Penjelajah
                </h2>
                <p className="text-[#374151]/60 font-sans tracking-[0.4em] text-sm md:text-base uppercase font-black">
                    SIAPA YANG AKAN BERPETUALANG HARI INI?
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-10 w-full">
                {playerName ? (
                    <button
                        onClick={handleEnterGame}
                        className="group relative w-full sm:w-85 transition-all duration-300 hover:scale-105 active:translate-y-1"
                    >
                        <div className={`${cardBg} rounded-[48px] border-[6px] border-[#374151] p-10 flex flex-col items-center gap-8 overflow-hidden relative shadow-[12px_12px_0_#374151]`}>
                            {/* Decorative background circle */}
                            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/40 rounded-full blur-3xl group-hover:bg-white/60 transition-colors" />
                            
                            <div className="w-36 h-36 rounded-3xl bg-white border-[4px] border-[#374151] flex items-center justify-center shadow-[6px_6px_0_#374151] relative z-10 rotate-[-3deg] group-hover:rotate-[3deg] transition-transform">
                                <User className="w-20 h-20 text-[#374151]" />
                            </div>
                            
                            <div className="text-center relative z-10">
                                <p className="text-6xl md:text-7xl text-[#374151] mb-2 group-hover:text-[#D97706] transition-colors">
                                    {playerName}
                                </p>
                                <div className="flex flex-col items-center gap-3">
                                    <div className="flex items-center justify-center gap-2 bg-white/50 px-4 py-1.5 rounded-2xl border-[3px] border-[#374151] rotate-1">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#68D77B] animate-pulse" />
                                        <p className="text-[#374151] text-sm font-sans uppercase tracking-[0.2em] font-black">
                                            Data Tersimpan
                                        </p>
                                    </div>
                                    {firstPartner && (
                                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border-[3px] border-[#374151] -rotate-1 shadow-[4px_4px_0_#374151]">
                                            <PawPrint className="w-5 h-5 text-[#374151]" />
                                            <p className="text-[#374151] text-xl font-bold">
                                                {firstPartner.nickname || firstPartner.name}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="w-full h-18 bg-[#68D77B] hover:bg-[#5bbd6b] rounded-2xl border-[4px] border-[#374151] flex items-center justify-center gap-4 text-[#374151] font-black font-sans text-2xl shadow-[6px_6px_0_#374151] active:shadow-none active:translate-y-1 transition-all">
                                <Play className="w-8 h-8 fill-current" />
                                <span>MASUK WORLD</span>
                            </div>
                        </div>
                    </button>
                ) : (
                    <button
                        onClick={() => startTransition(() => router.push('/create-character'))}
                        className="group relative w-full sm:w-80 transition-all duration-300 hover:scale-105 active:translate-y-1"
                    >
                        <div className="bg-white rounded-[40px] border-[5px] border-[#374151] p-8 flex flex-col items-center gap-6 overflow-hidden relative shadow-[10px_10px_0_#374151]">
                            <div className="w-32 h-32 rounded-3xl bg-gray-100 border-[4px] border-dashed border-[#374151]/40 flex items-center justify-center relative z-10 group-hover:rotate-[-2deg] transition-transform">
                                <Plus className="w-16 h-16 text-[#374151]/40" />
                            </div>
                            
                            <div className="text-center relative z-10">
                                <p className="text-5xl text-[#374151]/40 mb-1">
                                    Karakter Baru
                                </p>
                                <p className="text-[#374151]/30 text-sm font-sans uppercase tracking-widest font-black">
                                    Mulai Kisahmu
                                </p>
                            </div>
                            
                            <div className="w-full h-16 bg-white border-[4px] border-[#374151] rounded-2xl flex items-center justify-center gap-3 text-[#374151] font-black font-sans text-xl shadow-[4px_4px_0_#374151] group-hover:bg-gray-50 transition-colors">
                                <Plus className="w-6 h-6" />
                                <span>BUAT BARU</span>
                            </div>
                        </div>
                    </button>
                )}
            </div>

            <button
                onClick={handleLogout}
                className="mt-4 flex items-center gap-2 text-3xl text-[#374151]/50 hover:text-[#D97706] transition-all font-black decoration-[#D97706]/20 underline underline-offset-4"
            >
                Keluar & Ganti Akun
            </button>
        </div>
    )
}
