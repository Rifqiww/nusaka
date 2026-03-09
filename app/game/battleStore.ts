import { create } from "zustand";
import { Creature } from "../nusadex/creatures";
import { PartnerCreature } from "../nusadex/store";

export type BattlePhase = 'intro' | 'select_action' | 'player_attack' | 'enemy_attack' | 'catch_attempt' | 'win' | 'catch_success' | 'flee';

interface BattleState {
    // Proximity
    nearbyCreature: Creature | null;
    setNearbyCreature: (creature: Creature | null) => void;

    // Battle instance
    isActive: boolean;
    wildCreature: Creature | null;
    wildHp: number;
    wildMaxHp: number;

    playerCreature: PartnerCreature | null; // From useCreatureStore.firstPartner
    playerHp: number;
    playerMaxHp: number;

    phase: BattlePhase;
    message: string;

    startBattle: (wild: Creature, playerPartner: any) => void;
    setPhase: (phase: BattlePhase, message?: string) => void;
    damageWild: (amount: number) => void;
    damagePlayer: (amount: number) => void;
    endBattle: () => void;
}

export const useBattleStore = create<BattleState>((set, get) => ({
    nearbyCreature: null,
    setNearbyCreature: (creature) => set({ nearbyCreature: creature }),

    isActive: false,
    wildCreature: null,
    wildHp: 100,
    wildMaxHp: 100,

    playerCreature: null,
    playerHp: 100,
    playerMaxHp: 100,

    phase: 'intro',
    message: '',

    startBattle: (wild, playerPartner) => {
        // Simple scaling, wild pokemon has ~30 HP for testing
        const wildMax = 35 + Math.floor(Math.random() * 15);
        const playerMax = 50 + (playerPartner?.level || 1) * 5;

        set({
            isActive: true,
            wildCreature: wild,
            wildHp: wildMax,
            wildMaxHp: wildMax,
            playerCreature: playerPartner,
            playerHp: playerMax,
            playerMaxHp: playerMax,
            phase: 'intro',
            message: `A wild ${wild.name} appeared!`
        });
    },

    setPhase: (phase, message) => set((state) => ({ phase, message: message ?? state.message })),

    damageWild: (amount) => set((state) => {
        const newHp = Math.max(0, state.wildHp - amount);
        return { wildHp: newHp };
    }),

    damagePlayer: (amount) => set((state) => {
        const newHp = Math.max(0, state.playerHp - amount);
        return { playerHp: newHp };
    }),

    endBattle: () => set({
        isActive: false,
        wildCreature: null,
        playerCreature: null,
        phase: 'intro'
    })
}));
