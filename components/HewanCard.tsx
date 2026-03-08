import React from 'react';
import Image from 'next/image';

interface PokemonCardProps {
  image?: string;
  name?: string;
  level?: number;
  isEmpty?: boolean;
}

const PokemonCard = ({ image, name, level, isEmpty }: PokemonCardProps) => {
  if (isEmpty || !name || !image || level === undefined) {
    return (
      <div className="w-full bg-[#E5E7EB] border-[4px] border-[#9CA3AF] border-dashed rounded-[32px] p-2 h-24 flex items-center cursor-pointer hover:bg-[#D1D5DB] hover:border-solid transition-all group">
        <div className="w-16 h-16 rounded-full border-[3px] border-[#9CA3AF] border-dashed flex items-center justify-center bg-[#E5E7EB] ml-2 group-hover:scale-110 transition-transform">
          <span className="text-[#9CA3AF] text-3xl font-black">+</span>
        </div>
        <span className="ml-4 text-[#9CA3AF] text-3xl uppercase font-black tracking-widest bg-[#F3F4F6] px-4 py-1 rounded-xl">Kosong</span>
      </div>
    );
  }

  // Soft cartoon Pokemon Party slot look
  return (
    <div className="w-full bg-white border-[4px] border-[#374151] rounded-[32px] p-1 pr-6 flex items-center cursor-pointer hover:-translate-y-1 hover:bg-[#F3F4F6] transition-all relative overflow-hidden group">
      {/* Sprite */}
      <div className="w-20 h-20 bg-[#FCA5A5] border-[4px] border-[#374151] rounded-full shrink-0 flex items-center justify-center relative overflow-hidden ml-1 group-hover:scale-105 transition-transform">
        <Image src={image} alt={name} fill className="object-contain p-2 drop-shadow-md" />
      </div>

      {/* Info */}
      <div className="ml-5 flex-1 mt-1 text-[#374151]">
        <div className="flex justify-between items-end mb-1">
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-wide leading-none">{name}</h3>
          <div className="flex items-center bg-[#FEF08A] px-3 py-1 pb-0 rounded-xl border-[3px] border-[#374151] rotate-[2deg] group-hover:rotate-0 transition-transform">
            <span className="text-[#374151] text-xl font-black">Lv.{level}</span>
          </div>
        </div>
        {/* Soft HP Bar */}
        <div className="flex items-center gap-2 mt-2">
          <div className="bg-[#374151] text-white text-xs font-black px-2 py-0.5 rounded-md border-[2px] border-[#374151] flex items-center h-full">HP</div>
          <div className="flex-1 bg-[#374151] p-[4px] rounded-full mt-0 border-[2px] border-[#374151] relative">
            <div className="absolute top-0 w-full h-1 bg-white/20 z-10 pointer-events-none rounded-full"></div>
            <div className="w-full bg-white h-2 rounded-full overflow-hidden">
              <div className="bg-[#4ADE80] w-[85%] h-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;
