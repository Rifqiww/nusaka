import { create } from "zustand";

interface JoystickState {
  forward: number;
  right: number;
  setMovement: (forward: number, right: number) => void;

  // Player Profile Data
  playerId: string | null;
  playerName: string | null;
  hasSaveData: boolean | null; // null = checking, false = no save, true = has save
  setPlayerProfile: (
    id: string | null,
    name: string | null,
    hasSave: boolean,
  ) => void;

  // UI State
  menuState: "checking" | "auth" | "main" | "select_character" | "create_character" | "playing" | "battle";
  setMenuState: (
    state: "checking" | "auth" | "main" | "select_character" | "create_character" | "playing" | "battle",
  ) => void;

  isNusadexOpen: boolean;
  setNusadexOpen: (isOpen: boolean) => void;

  isAudioMuted: boolean;
  setAudioMuted: (isMuted: boolean) => void;

  audioVolume: number;
  setAudioVolume: (volume: number) => void;
  reset: () => void;
}

export const useJoystickStore = create<JoystickState>((set) => ({
  forward: 0,
  right: 0,
  setMovement: (forward, right) => set({ forward, right }),

  playerId: null,
  playerName: null,
  hasSaveData: null,
  setPlayerProfile: (
    id: string | null,
    name: string | null,
    hasSave: boolean,
  ) => set({ playerId: id, playerName: name, hasSaveData: hasSave }),

  menuState: "checking",
  setMenuState: (state) => set({ menuState: state }),

  isNusadexOpen: false,
  setNusadexOpen: (isOpen: boolean) => set({ isNusadexOpen: isOpen }),

  isAudioMuted: false,
  setAudioMuted: (isMuted) => set({ isAudioMuted: isMuted }),

  audioVolume: 0.4,
  setAudioVolume: (volume) => set({ audioVolume: volume }),

  reset: () => set({
    playerId: null,
    playerName: null,
    hasSaveData: null,
    menuState: "auth",
  }),
}));
