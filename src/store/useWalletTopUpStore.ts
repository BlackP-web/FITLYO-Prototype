import { create } from 'zustand'

interface WalletTopUpState {
  isOpen: boolean
  openTopUp: () => void
  closeTopUp: () => void
}

export const useWalletTopUpStore = create<WalletTopUpState>((set) => ({
  isOpen: false,
  openTopUp: () => set({ isOpen: true }),
  closeTopUp: () => set({ isOpen: false }),
}))

