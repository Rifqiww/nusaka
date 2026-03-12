'use client'

import React, { useState } from 'react';
import { useJoystickStore } from '@/app/game/store';
import { Volume2, VolumeX, Volume1, Volume } from 'lucide-react';

export default function AudioPlayerControl() {
    const isAudioMuted = useJoystickStore(s => s.isAudioMuted);
    const setAudioMuted = useJoystickStore(s => s.setAudioMuted);
    const audioVolume = useJoystickStore(s => s.audioVolume);
    const setAudioVolume = useJoystickStore(s => s.setAudioVolume);
    const [isHovered, setIsHovered] = useState(false);

    const toggleMute = () => {
        setAudioMuted(!isAudioMuted);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setAudioVolume(val);
        if (val === 0 && !isAudioMuted) {
            setAudioMuted(true);
        } else if (val > 0 && isAudioMuted) {
            setAudioMuted(false);
        }
    };

    const getVolumeIcon = () => {
        if (isAudioMuted || audioVolume === 0) return <VolumeX size={24} strokeWidth={3} className="text-[#374151]" />;
        if (audioVolume < 0.3) return <Volume size={24} strokeWidth={3} className="text-[#374151]" />;
        if (audioVolume < 0.7) return <Volume1 size={24} strokeWidth={3} className="text-[#374151]" />;
        return <Volume2 size={24} strokeWidth={3} className="text-[#374151]" />;
    };

    return (
        <div
            className="flex items-center justify-end group mt-2 mr-6 md:mr-8 mb-4 hover:cursor-pointer z-50 pointer-events-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`
                    flex items-center bg-white border-[4px] border-[#374151] rounded-full 
                    transition-all duration-300 ease-out overflow-hidden shadow-[4px_4px_0_#374151]
                    ${isHovered ? 'w-56 px-4' : 'w-14 justify-center'}
                `}
                style={{ height: '3.5rem' }}
            >
                <div
                    className={`flex items-center gap-3 transition-all duration-300 ${isHovered ? 'opacity-100 w-full' : 'opacity-0 w-0 hidden'}`}
                >
                    <button onClick={toggleMute} className="hover:scale-110 active:scale-95 transition-transform flex-shrink-0 bg-[#FEF08A] rounded-full p-1.5 border-[3px] border-[#374151] shadow-sm">
                        {getVolumeIcon()}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isAudioMuted ? 0 : audioVolume}
                        onChange={handleVolumeChange}
                        className="w-full h-4 bg-[#E5E7EB] border-[3px] border-[#374151] rounded-full appearance-none outline-none cursor-pointer flex-1
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                            [&::-webkit-slider-thumb]:bg-[#EF4444] [&::-webkit-slider-thumb]:border-[4px] [&::-webkit-slider-thumb]:border-[#374151]
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-grab active:[&::-webkit-slider-thumb]:cursor-grabbing"
                    />
                </div>

                {!isHovered && (
                    <button
                        onClick={toggleMute}
                        className="w-full h-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                    >
                        {getVolumeIcon()}
                    </button>
                )}
            </div>
        </div>
    );
}
