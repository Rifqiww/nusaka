"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import { Power, Search, Loader2, ChevronLeft } from "lucide-react";
import { useJoystickStore } from "../game/store";
import { NUSA_CREATURES, type Creature } from "./creatures";

const Creature3D = dynamic(() => import("./Creature3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black/5 rounded-2xl animate-pulse" />
  ),
});

export default function NusadexPopup() {
  const { isNusadexOpen, setNusadexOpen } = useJoystickStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCreature, setSelectedCreature] = useState<Creature | null>(
    null,
  );
  const [view, setView] = useState<"list" | "detail">("list");
  const [isClosing, setIsClosing] = useState(false);

  // New: Persistence states
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isNusadexOpen) {
      setHasBeenOpened(true);
      setIsVisible(true);
      setIsClosing(false);
    } else if (hasBeenOpened) {
      // If it was already open and now closed via store, trigger animation
      // (This covers closing via clicking the backdrop or external calls)
      if (!isClosing) handleClose();
    }
  }, [isNusadexOpen]);

  const filteredCreatures = useMemo(() => {
    return NUSA_CREATURES.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toString().padStart(4, "0").includes(searchTerm),
    );
  }, [searchTerm]);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setNusadexOpen(false);
      setIsClosing(false);
      setView("list");
      setSelectedCreature(null);
    }, 450);
  };

  const handleSelect = (creature: Creature) => {
    setSelectedCreature(creature);
    setView("detail");
  };

  // Lazy load only after first interaction to save initial page load performance
  if (!hasBeenOpened) return null;

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center p-4 transition-all duration-300
        ${isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-500 
          ${isClosing ? "opacity-0" : "opacity-100"}`}
        onClick={handleClose}
      />

      {/* Main Device Container */}
      <div
        className={`relative w-full max-w-sm bg-[#f5f5dc] border-4 border-[#4a4a4a] rounded-[2.5rem] shadow-[20px_20px_0px_0px_rgba(0,0,0,0.2)] transform overflow-hidden
          ${isClosing ? "animate-screen-off" : isVisible ? "animate-screen-on" : ""}`}
        style={{
          height: "85vh",
          maxHeight: "700px",
          backgroundImage:
            'url("https://www.transparenttextures.com/patterns/recycled-paper.png")',
          fontFamily: "var(--font-nanum-pen)",
        }}
      >
        <div className="flex flex-col h-full relative z-10 pt-8">
          {/* Header Section */}
          <div className="flex items-center justify-between px-6 mb-4">
            <div className="flex items-center gap-2">
              {view === "detail" && (
                <button
                  onClick={() => setView("list")}
                  className="p-1 hover:bg-black/5 rounded-full transition-transform active:scale-90 cursor-pointer"
                >
                  <ChevronLeft className="w-8 h-8 text-[#4a4a4a]" />
                </button>
              )}
              <h2 className="text-4xl text-[#2d2d2d] tracking-wider drop-shadow-sm">
                {view === "list" ? "NUSADEX" : "DETAIL"}
              </h2>
            </div>
            {view === "list" && (
              <button
                onClick={handleClose}
                className="p-1 hover:bg-black/5 rounded-full transition-transform active:scale-90 cursor-pointer"
              >
                <Power className="w-8 h-8 text-red-600/80" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {/* List View */}
            {view === "list" && (
              <div className="flex flex-col h-full px-6 animate-in fade-in slide-in-from-left duration-300">
                <div className="relative mb-6">
                  <input
                    type="text"
                    placeholder="Cari Anomali..."
                    className="w-full bg-transparent border-b-2 border-[#4a4a4a] px-4 py-2 text-3xl focus:outline-none placeholder-[#4a4a4a]/40 text-[#2d2d2d]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute right-2 top-3 w-5 h-5 text-[#4a4a4a]/40" />
                </div>

                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar pb-10">
                  <div className="grid grid-cols-2 gap-4">
                    {filteredCreatures.map((creature) => (
                      <div
                        key={creature.id}
                        onClick={() => handleSelect(creature)}
                        className="group flex flex-col items-center bg-white/40 border-2 border-[#4a4a4a]/10 hover:border-[#4a4a4a] rounded-3xl transition-all cursor-pointer p-2 overflow-hidden"
                      >
                        <div className="relative w-full aspect-square bg-linear-to-b from-transparent to-black/5 rounded-2xl flex items-center justify-center overflow-hidden pointer-events-none">
                          <Suspense
                            fallback={
                              <Loader2 className="w-6 h-6 animate-spin text-black/10" />
                            }
                          >
                            <Creature3D
                              modelUrl={creature.modelUrl}
                              autoRotate={false}
                            />
                          </Suspense>
                          <div className="absolute top-1 left-2 text-lg font-bold opacity-20">
                            #{creature.id}
                          </div>
                        </div>
                        <h3 className="text-2xl text-[#2d2d2d] mt-1 text-center truncate w-full px-1">
                          {creature.name}
                        </h3>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Detail View */}
            {view === "detail" && selectedCreature && (
              <div className="flex flex-col h-full px-6 animate-in fade-in slide-in-from-right duration-300 overflow-y-auto custom-scrollbar pb-8">
                <h2 className="text-6xl text-[#2d2d2d] leading-none">
                  {selectedCreature.name}
                </h2>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-2xl font-bold px-4 py-1 border-2 border-[#4a4a4a]/20 rounded-xl ${selectedCreature.accent} bg-white/40`}
                  >
                    {selectedCreature.type}
                  </span>
                  <span className="text-3xl text-[#4a4a4a]/40">
                    No. {selectedCreature.id.toString().padStart(4, "0")}
                  </span>
                </div>

                {/* 3D Model Display */}
                <div className="relative w-full aspect-square shrink-0 bg-linear-to-b from-emerald-50/50 to-emerald-200/10 rounded-[2.5rem] border-2 border-dashed border-[#4a4a4a]/15 mb-6 flex items-center justify-center overflow-hidden">
                  <Suspense
                    fallback={
                      <Loader2 className="w-8 h-8 animate-spin text-[#4a4a4a]" />
                    }
                  >
                    <Creature3D
                      key={selectedCreature.id}
                      modelUrl={selectedCreature.modelUrl}
                      autoRotate={true}
                    />
                  </Suspense>
                </div>

                {/* Progression Stats */}
                <div className="mb-6 px-2">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-3xl text-[#2d2d2d]">
                      Level {selectedCreature.level}
                    </span>
                    <span className="text-xl text-[#4a4a4a]/60">
                      EXP {selectedCreature.exp}/100
                    </span>
                  </div>
                  <div className="w-full h-4 bg-white/50 border-2 border-[#4a4a4a]/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4a4a4a]/40"
                      style={{ width: `${selectedCreature.exp}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <hr className="border-[#4a4a4a]/10 mb-4" />
                  <div className="bg-white/30 p-4 border-l-4 border-[#4a4a4a] rounded-r-2xl italic shadow-sm">
                    <p className="text-3xl text-[#4a4a4a] leading-tight">
                      "{selectedCreature.description}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 text-center">
                    <div className="bg-[#4a4a4a]/10 p-3 rounded-2xl border border-[#4a4a4a]/5">
                      <span className="block text-lg text-[#4a4a4a]/60 uppercase tracking-tighter">
                        HABITAT
                      </span>
                      <span className="text-2xl text-[#2d2d2d] uppercase">
                        {selectedCreature.habitat}
                      </span>
                    </div>
                    <div className="bg-[#4a4a4a]/10 p-3 rounded-2xl border border-[#4a4a4a]/5">
                      <span className="block text-lg text-[#4a4a4a]/60 uppercase tracking-tighter">
                        STATUS
                      </span>
                      <span className="text-2xl text-[#2d2d2d] uppercase">
                        {selectedCreature.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Device UI Decoration */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#4a4a4a]/40 rounded-full" />

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4a4a4a11;
            border-radius: 10px;
          }

          @keyframes screenOn {
            0% {
              transform: scale(0.1, 0.001);
              opacity: 0;
            }
            40% {
              transform: scale(1, 0.005);
              opacity: 1;
            }
            100% {
              transform: scale(1, 1);
              opacity: 1;
            }
          }
          @keyframes screenOff {
            0% {
              transform: scale(1, 1);
              opacity: 1;
            }
            30% {
              transform: scale(1, 0.005);
              opacity: 1;
            }
            100% {
              transform: scale(0, 0);
              opacity: 0;
            }
          }
          .animate-screen-on {
            animation: screenOn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          .animate-screen-off {
            animation: screenOff 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
        `}</style>
      </div>
    </div>
  );
}
