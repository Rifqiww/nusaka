'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useJoystickStore } from '../game/store';
import { useTransitionStore } from '@/app/store/transitionStore';
import CharacterViewer from '@/components/CharacterViewer';
import TrainerInfo from '@/components/CharacterInfo';
import PokemonGrid from '@/components/HewanFlex';

const pokemons = [
  {
    id: 1,
    name: 'Pikachu',
    level: 25,
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
  },
  {
    id: 2,
    name: 'Komodo',
    level: 12,
    // Using placeholder since we don't have komodo sprite yet
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png'
  }
];

const trainerData = {
  name: 'Nusaka',
  pokemons: pokemons
};

export default function ProfilePage() {
  const router = useRouter();
  const { startTransition } = useTransitionStore();
  const { playerName } = useJoystickStore();

  // To avoid hydration mismatch if playerName starts empty text
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  const trainerName = mounted ? (playerName || 'Penjelajah') : '...';

  return (
    <div
      className="min-h-screen bg-[#FFF9E6] p-0 md:p-6 lg:p-8 flex flex-col relative"
      style={{ fontFamily: 'var(--font-nanum-pen)' }}
    >
      {/* Decorative Retro Grid Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.08]"
        style={{ backgroundImage: 'radial-gradient(#374151 2px, transparent 2px)', backgroundSize: '24px 24px' }}
      />
      <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col relative z-10">
        {/* Header navigation */}
        <header className="mb-0 md:mb-6 flex items-center justify-between border-b-[4px] border-[#374151] p-4 md:p-0 md:pb-4 bg-[#FFF9E6] sticky top-0 z-50">
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={() => startTransition(() => router.push('/'))}
              className="w-12 h-12 md:w-16 md:h-16 bg-white border-[4px] border-[#374151] rounded-full flex items-center justify-center hover:bg-[#FEF08A] hover:-translate-x-1 hover:-translate-y-1 transition-transform text-[#374151] text-4xl md:text-5xl font-black"
            >
              ←
            </button>
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-black text-[#374151] tracking-tight mt-1 md:mt-3">
              Info Penjelajah
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 md:gap-6 lg:gap-8 flex-1">
          {/* Left Column: Trainer Card & Stats */}
          <div className="lg:col-span-5 flex flex-col gap-0 md:gap-6 border-b-[4px] border-[#374151] md:border-none">
            <div className="bg-[#FEF08A] border-b-[4px] md:border-[4px] border-[#374151] md:rounded-[32px] p-4 md:p-5 relative group">
              <h2 className="text-[#374151] text-3xl font-black uppercase mb-3 tracking-widest pl-2 md:pl-0 flex items-center gap-3">
                <span className="bg-white border-[3px] border-[#374151] rounded-xl px-3 py-1 rotate-[-4deg] inline-block text-2xl group-hover:rotate-[4deg] transition-transform">✨</span>
                Penampilan
              </h2>
              <div className="bg-white border-[4px] border-[#374151] rounded-2xl md:rounded-3xl overflow-hidden isolate">
                <CharacterViewer />
              </div>
            </div>

            <TrainerInfo
              name={trainerName}
              pokemonCount={trainerData.pokemons.length}
              friendCount={67}
            />
          </div>

          {/* Right Column: Pokemon Party */}
          <div className="lg:col-span-7 flex flex-col flex-1">
            <div className="bg-[#A7F3D0] md:border-[4px] border-[#374151] p-4 md:p-6 md:rounded-[40px] h-full flex flex-col relative overflow-hidden flex-1 group/right">
              <div className="flex flex-row justify-between items-center mb-4 md:mb-6 relative z-10 border-b-[4px] border-dashed border-[#374151] pb-4">
                <h2 className="text-3xl md:text-5xl text-[#374151] font-black uppercase tracking-tight pl-2 md:pl-0 flex items-center gap-3">
                  <span className="bg-white border-[4px] border-[#374151] rounded-full p-2 rotate-[4deg] inline-block text-3xl group-hover/right:-rotate-[4deg] transition-transform">🐾</span>
                  Daftar Hewan
                </h2>

                <button className="bg-white text-[#374151] border-[4px] border-[#374151] px-4 py-1 md:px-5 md:py-2 rounded-2xl hover:bg-[#FEF08A] hover:-translate-y-1 transition-transform flex justify-center items-center gap-2">
                  <span className="text-xl md:text-2xl font-black uppercase tracking-widest">+ Baru</span>
                </button>
              </div>

              <div className="relative z-10 flex-1">
                <PokemonGrid pokemons={trainerData.pokemons} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
