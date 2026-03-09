import React from 'react';
import { UserPlus } from 'lucide-react';

interface TrainerInfoProps {
  name: string;
  pokemonCount: number;
  friendCount: number;
}

const TrainerInfo = ({ name, pokemonCount, friendCount }: TrainerInfoProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-0 md:gap-6 w-full group">
      {/* Trainer Card Base */}
      <div className="flex-1 bg-[#FCA5A5] border-b-[4px] md:border-[4px] border-[#374151] md:rounded-[32px] p-6 text-[#374151] overflow-hidden relative">
        <div className="bg-white/40 border-[3px] border-[#374151] rounded-xl px-4 py-1 mb-4 inline-block rotate-[-2deg] group-hover:rotate-[2deg] transition-transform">
          <h2 className="text-lg md:text-xl uppercase tracking-widest font-black leading-none mt-1">⭐ Lisensi Penjelajah</h2>
        </div>
        <h1 className="text-5xl md:text-[5rem] font-black tracking-tight mb-6">{name}</h1>

        <button className="bg-white text-[#374151] border-[4px] border-[#374151] text-xl md:text-2xl font-black uppercase px-4 py-2 md:px-6 md:py-3 rounded-2xl flex justify-center items-center gap-2 md:gap-3 hover:bg-[#FEF08A] hover:-translate-y-1 transition-transform shadow-sm">
          <UserPlus className="w-6 h-6 md:w-7 md:h-7" strokeWidth={3} />
          Tambah Teman
        </button>
      </div>

      {/* Stats Column */}
      <div className="flex flex-row md:flex-col gap-0 md:gap-6 w-full md:w-[220px] shrink-0 border-b-[4px] border-[#374151] md:border-none">

        {/* Koleksi */}
        <div className="flex-1 bg-[#93C5FD] border-r-[4px] md:border-r-[0px] md:border-[4px] border-[#374151] md:rounded-[32px] flex flex-col items-center justify-center py-5 relative overflow-hidden group/koleksi hover:-translate-y-1 transition-transform">
          <div className="w-full flex items-center justify-center relative px-4">
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 border-b-[4px] border-dashed border-[#374151] opacity-30 z-0"></div>
            <div className="bg-[#BFDBFE] border-[3px] border-[#374151] px-4 py-1.5 rounded-xl z-10">
              <h3 className="text-[#374151] text-[15px] font-black uppercase tracking-widest leading-none mt-0.5">Koleksi</h3>
            </div>
          </div>
          <div className="text-6xl md:text-[4.5rem] mt-3 font-black text-[#374151] group-hover/koleksi:scale-110 transition-transform leading-none">
            {pokemonCount}
          </div>
        </div>

        {/* Teman */}
        <div className="flex-1 bg-[#A7F3D0] md:border-[4px] border-[#374151] md:rounded-[32px] flex flex-col items-center justify-center py-5 relative overflow-hidden group/teman hover:-translate-y-1 transition-transform">
          <div className="w-full flex items-center justify-center relative px-4">
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 border-b-[4px] border-dashed border-[#374151] opacity-30 z-0"></div>
            <div className="bg-[#D1FAE5] border-[3px] border-[#374151] px-4 py-1.5 rounded-xl z-10">
              <h3 className="text-[#374151] text-[15px] font-black uppercase tracking-widest leading-none mt-0.5">Teman</h3>
            </div>
          </div>
          <div className="text-6xl md:text-[4.5rem] mt-3 font-black text-[#374151] group-hover/teman:scale-110 transition-transform leading-none">
            {friendCount}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrainerInfo;
