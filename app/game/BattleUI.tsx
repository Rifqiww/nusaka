'use client'

import React, { useEffect, useRef, useState } from 'react';
import { useBattleStore } from './battleStore';
import { useCreatureStore } from '../nusadex/store';
import { useJoystickStore } from './store';
import dynamic from 'next/dynamic';

const BattleArena = dynamic(() => import('./BattleArena'), { ssr: false });

export default function BattleUI() {
    const {
        isActive,
        wildCreature,
        wildHp,
        wildMaxHp,
        playerCreature,
        playerHp,
        playerMaxHp,
        phase,
        message,
        setPhase,
        damageWild,
        damagePlayer,
        endBattle
    } = useBattleStore();

    const { setMenuState } = useJoystickStore();
    const { setFirstPartner, capturedCreatures } = useCreatureStore(); // We'll just push to array manually or use setFirstPartner for simplicity if they don't have it.

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [menuOpen, setMenuOpen] = useState(true);

    useEffect(() => {
        if (isActive) {
            audioRef.current = new Audio('/sfx/battlebgm.mp3');
            audioRef.current.loop = true;
            audioRef.current.volume = 0.5;
            audioRef.current.play().catch(e => console.log('Autoplay prevented:', e));
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, [isActive]);

    if (!isActive || !wildCreature || !playerCreature) return null;

    const enemyHpPercent = Math.max(0, (wildHp / wildMaxHp) * 100);
    const playerHpPercent = Math.max(0, (playerHp / playerMaxHp) * 100);

    const getHpColor = (percent: number) => {
        if (percent > 50) return 'bg-[#4ADE80]'; // Green
        if (percent > 20) return 'bg-[#FBBF24]'; // Yellow
        return 'bg-[#EF4444]'; // Red
    };

    const handleRun = () => {
        setMenuOpen(false);
        setPhase('flee', 'Got away safely!');
        setTimeout(() => {
            endBattle();
            setMenuState('playing');
        }, 1500);
    };

    const handleAttack = () => {
        setMenuOpen(false);
        setPhase('player_attack', `${playerCreature.nickname || playerCreature.name} used Tackle!`);

        // Simple attack animation delay
        setTimeout(() => {
            const damage = 10 + Math.floor(Math.random() * 10);
            damageWild(damage);

            if (wildHp - damage <= 0) {
                setTimeout(() => {
                    setPhase('win', `Wild ${wildCreature.name} fainted!`);
                    setTimeout(() => {
                        endBattle();
                        setMenuState('playing');
                    }, 2000);
                }, 1000);
            } else {
                // Enemy turn
                setTimeout(() => {
                    setPhase('enemy_attack', `Wild ${wildCreature.name} strikes back!`);
                    setTimeout(() => {
                        const enemyDmg = 5 + Math.floor(Math.random() * 8);
                        damagePlayer(enemyDmg);

                        if (playerHp - enemyDmg <= 0) {
                            setTimeout(() => {
                                setPhase('flee', 'You blacked out!');
                                setTimeout(() => {
                                    endBattle();
                                    setMenuState('playing'); // Simple respawn
                                }, 2000);
                            }, 1000);
                        } else {
                            setTimeout(() => {
                                setPhase('select_action', `What will ${playerCreature.nickname || playerCreature.name} do?`);
                                setMenuOpen(true);
                            }, 1000);
                        }
                    }, 1500);
                }, 1500);
            }
        }, 1500);
    };

    const handleCatch = () => {
        setMenuOpen(false);
        setPhase('catch_attempt', 'You threw an Arloji!');

        setTimeout(() => {
            // Simple catch rate logic: lower HP = better chance
            const chance = 1 - (wildHp / wildMaxHp);
            const roll = Math.random();

            // Baseline 20% catch rate, up to 100% if 1 HP
            if (roll < chance + 0.2) {
                setPhase('catch_success', `Gotcha! ${wildCreature.name} was caught!`);
                useCreatureStore.setState(state => ({
                    capturedCreatures: [...state.capturedCreatures, { ...wildCreature, level: 1, exp: 0 }]
                }));
                setTimeout(() => {
                    endBattle();
                    setMenuState('playing');
                }, 2500);
            } else {
                setPhase('enemy_attack', `Oh no! The wild ${wildCreature.name} broke free!`);
                setTimeout(() => {
                    setPhase('select_action', `What will ${playerCreature.nickname || playerCreature.name} do?`);
                    setMenuOpen(true);
                }, 2000);
            }
        }, 2000);
    };

    const wildAnim = phase === 'enemy_attack' ? 'attack' : 'idle';
    const playerAnim = phase === 'player_attack' ? 'attack' : 'idle';

    return (
        <div className="absolute inset-0 z-[100] flex flex-col bg-gradient-to-b from-[#87CEEB] to-[#8BC34A] pointer-events-auto" style={{ fontFamily: 'var(--font-nanum-pen)' }}>

            {/* Action Area */}
            <div className="flex-1 relative overflow-hidden">
                {/* Full Screen 3D Arena */}
                <BattleArena
                    playerUrl={playerCreature.modelUrl}
                    playerScale={playerCreature.scale}
                    playerAnim={playerAnim}
                    enemyUrl={wildCreature.modelUrl}
                    enemyScale={wildCreature.scale}
                    enemyAnim={wildAnim}
                />

                {/* --- TOP LEFT: Enemy HUD --- */}
                <div className="absolute top-8 left-8 bg-white border-[4px] border-[#374151] rounded-tl-3xl rounded-br-3xl px-6 py-3 w-80 shadow-[6px_6px_0_#374151]">
                    <div className="flex justify-between items-center border-b-2 border-dashed border-[#9CA3AF] pb-1 mb-2">
                        <span className="text-3xl font-black uppercase text-[#374151]">{wildCreature.name}</span>
                        <span className="text-xl font-bold bg-[#FEF08A] px-2 py-0.5 rounded-lg border-2 border-[#374151] shadow-sm">Lv.{wildCreature.level || 5}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#374151] bg-[#FCA5A5] px-1.5 py-0.5 rounded border border-[#374151]">HP</span>
                        <div className="flex-1 h-4 bg-[#374151] p-[3px] rounded-full border-2 border-[#374151]">
                            <div className="w-full h-full bg-white rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-500 ease-out ${getHpColor(enemyHpPercent)}`} style={{ width: `${enemyHpPercent}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- BOTTOM RIGHT: Player HUD --- */}
                <div className="absolute bottom-8 right-8 bg-[#E5E7EB] border-[4px] border-[#374151] rounded-tl-3xl rounded-br-3xl px-6 py-4 w-96 shadow-[6px_6px_0_#374151]">
                    <div className="flex justify-between items-center border-b-2 border-solid border-[#9CA3AF] pb-1 mb-2">
                        <span className="text-3xl font-black uppercase text-[#374151]">{playerCreature.nickname || playerCreature.name}</span>
                        <span className="text-xl font-bold bg-[#FEF08A] px-2 py-0.5 rounded-lg border-2 border-[#374151] shadow-sm">Lv.{playerCreature.level || 5}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#374151] bg-[#FCA5A5] px-1.5 py-0.5 rounded border border-[#374151]">HP</span>
                        <div className="flex-1 h-5 bg-[#374151] p-[4px] rounded-full border-2 border-[#374151]">
                            <div className="w-full h-full bg-white rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-500 ease-out ${getHpColor(playerHpPercent)}`} style={{ width: `${playerHpPercent}%` }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="text-right mt-1 text-2xl font-black text-[#374151]">
                        {Math.ceil(playerHp)} / {playerMaxHp}
                    </div>
                </div>      {/* Visual Effect overlays */}
                {phase === 'player_attack' && <div className="absolute inset-0 bg-white/40 animate-pulse pointer-events-none z-10"></div>}
                {phase === 'catch_attempt' && <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-xl animate-bounce z-20"></div>}
            </div>

            {/* Bottom Dialog Box (Menu Area) */}
            <div className="h-48 bg-[#E5E7EB] border-t-[8px] border-[#374151] flex">
                {/* Left: Message Log */}
                <div className="flex-1 bg-white m-4 border-[4px] border-[#374151] rounded-2xl p-6 shadow-inner flex items-center">
                    <p className="text-4xl text-[#374151] font-black uppercase tracking-wide leading-relaxed animate-[pulse_1s_ease-in-out_infinite]">{message}</p>
                </div>

                {/* Right: Command Buttons */}
                {menuOpen && (
                    <div className="w-[400px] m-4 ml-0 grid grid-cols-2 gap-3">
                        <button onClick={handleAttack} className="bg-[#EF4444] border-[4px] border-[#B91C1C] rounded-2xl flex items-center justify-center text-3xl font-black text-white uppercase hover:scale-105 transition-transform hover:shadow-[4px_4px_0_#B91C1C] shadow-[2px_2px_0_#B91C1C]">
                            FIGHT
                        </button>
                        <button onClick={handleCatch} className="bg-[#3B82F6] border-[4px] border-[#1D4ED8] rounded-2xl flex items-center justify-center text-3xl font-black text-white uppercase hover:scale-105 transition-transform hover:shadow-[4px_4px_0_#1D4ED8] shadow-[2px_2px_0_#1D4ED8]">
                            ARLOJI
                        </button>
                        <button className="bg-[#10B981] border-[4px] border-[#047857] rounded-2xl flex items-center justify-center text-3xl font-black text-white uppercase hover:scale-105 transition-transform hover:shadow-[4px_4px_0_#047857] shadow-[2px_2px_0_#047857] opacity-50 cursor-not-allowed">
                            POKÉMON
                        </button>
                        <button onClick={handleRun} className="bg-[#F59E0B] border-[4px] border-[#B45309] rounded-2xl flex items-center justify-center text-3xl font-black text-white uppercase hover:scale-105 transition-transform hover:shadow-[4px_4px_0_#B45309] shadow-[2px_2px_0_#B45309]">
                            RUN
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
