import { create } from 'zustand'

interface TransitionState {
    isActive: boolean;
    isRouting: boolean;
    startTransition: (callback: () => void) => void;
    finishTransition: () => void;
}

export const useTransitionStore = create<TransitionState>((set) => ({
    isActive: false,
    isRouting: false,
    startTransition: (callback) => {
        // Start closing animation
        set({ isActive: true });
        // Wait for the iris to close completely
        setTimeout(() => {
            set({ isRouting: true });
            callback();
        }, 550); // 550ms matches the CSS transition decently, allowing buffer
    },
    finishTransition: () => set({ isActive: false, isRouting: false }),
}));
