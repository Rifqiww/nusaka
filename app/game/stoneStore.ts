import { create } from "zustand";

interface StoneState {
    nearbyStoneId: number | null;
    setNearbyStoneId: (id: number | null) => void;
    
    isActive: boolean;
    startMinigame: () => void;
    endMinigame: () => void;

    respawnTrigger: number;
    triggerRespawn: () => void;
}

export const useStoneStore = create<StoneState>((set) => ({
    nearbyStoneId: null,
    setNearbyStoneId: (id) => set({ nearbyStoneId: id }),
    
    isActive: false,
    startMinigame: () => set({ isActive: true }),
    endMinigame: () => set({ isActive: false, nearbyStoneId: null }),

    respawnTrigger: 0,
    triggerRespawn: () => set((state) => ({ respawnTrigger: state.respawnTrigger + 1 }))
}));
