import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function hashPin(pin: string): string {
  let h = 5381;
  for (let i = 0; i < pin.length; i++) {
    h = ((h << 5) + h) ^ pin.charCodeAt(i);
    h = h >>> 0;
  }
  return h.toString(36);
}

interface PinState {
  pinEnabled: boolean;
  pinHash: string | null;
  isLocked: boolean;
  enablePin: (pin: string) => void;
  disablePin: () => void;
  changePin: (newPin: string) => void;
  verifyPin: (pin: string) => boolean;
  lock: () => void;
  unlock: () => void;
}

export const usePinStore = create<PinState>()(
  persist(
    (set, get) => ({
      pinEnabled: false,
      pinHash: null,
      isLocked: false,
      enablePin: (pin) => set({ pinEnabled: true, pinHash: hashPin(pin), isLocked: false }),
      disablePin: () => set({ pinEnabled: false, pinHash: null, isLocked: false }),
      changePin: (newPin) => set({ pinHash: hashPin(newPin) }),
      verifyPin: (pin) => get().pinHash === hashPin(pin),
      lock: () => set({ isLocked: true }),
      unlock: () => set({ isLocked: false }),
    }),
    {
      name: 'intizom-pin',
      partialize: (s) => ({ pinEnabled: s.pinEnabled, pinHash: s.pinHash }),
      onRehydrateStorage: () => (state) => {
        if (state?.pinEnabled) state.isLocked = true;
      },
    }
  )
);
