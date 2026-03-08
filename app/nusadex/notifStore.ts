import { create } from "zustand";

interface NotifState {
  hasNewNotif: boolean;
  setHasNewNotif: (value: boolean) => void;
}

export const useNotifStore = create<NotifState>((set) => ({
  hasNewNotif: true,
  setHasNewNotif: (value: boolean) => set({ hasNewNotif: value }),
}));
