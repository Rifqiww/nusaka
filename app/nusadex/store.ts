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
    addCreature: (creature: PartnerCreature) => void;
    updateCreature: (creature: PartnerCreature) => void;
    setFirstPartner: (creature: PartnerCreature) => void;
}

export const useCreatureStore = create<CreatureState>()(
    persist(
        (set) => ({
            capturedCreatures: [],
            firstPartner: null,
            hasChosenPartner: false,
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
                }));
            },
        }),
        {
            name: 'creature-storage',
        }
    )
);
