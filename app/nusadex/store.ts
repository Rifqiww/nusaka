import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Creature } from './creatures';

export interface PartnerCreature extends Creature {
    nickname?: string;
}

export interface CreatureState {
    capturedCreatures: PartnerCreature[];
    firstPartner: PartnerCreature | null;
    hasChosenPartner: boolean;
    seenIds: number[];
    addCreature: (creature: PartnerCreature) => void;
    updateCreature: (creature: PartnerCreature) => void;
    setFirstPartner: (creature: PartnerCreature) => void;
    markAsSeen: (id: number) => void;
}

export const useCreatureStore = create<CreatureState>()(
    persist(
        (set) => ({
            capturedCreatures: [],
            firstPartner: null,
            hasChosenPartner: false,
            seenIds: [],
            addCreature: (creature) =>
                set((state) => ({
                    capturedCreatures: [...state.capturedCreatures, creature],
                })),
            updateCreature: (creature) =>
                set((state) => ({
                    capturedCreatures: state.capturedCreatures.map((c) =>
                        c.id === creature.id ? creature : c
                    ),
                })),
            setFirstPartner: (creature) => {
                const starter: PartnerCreature = { ...creature, level: 0, exp: 0 };
                set(() => ({
                    firstPartner: starter,
                    hasChosenPartner: true,
                    capturedCreatures: [starter],
                    seenIds: [starter.id], // Starters are seen by default
                }));
            },
            markAsSeen: (id) =>
                set((state) => ({
                    seenIds: state.seenIds.includes(id)
                        ? state.seenIds
                        : [...state.seenIds, id],
                })),
        }),
        {
            name: 'creature-storage',
        }
    )
);
