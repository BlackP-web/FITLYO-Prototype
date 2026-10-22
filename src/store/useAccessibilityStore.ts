import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface AccessibilityState {
  largeText: boolean
  toggleLargeText: () => void
  setLargeText: (enabled: boolean) => void
}

const applyLargeTextPreference = (enabled: boolean) => {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('fitlyo-large-text', enabled)
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      largeText: false,
      toggleLargeText: () => set((state) => {
        const next = !state.largeText
        applyLargeTextPreference(next)
        return { largeText: next }
      }),
      setLargeText: (enabled) => {
        applyLargeTextPreference(enabled)
        set({ largeText: enabled })
      },
    }),
    {
      name: 'fitlyo-accessibility-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ largeText: state.largeText }),
      onRehydrateStorage: () => (state) => {
        applyLargeTextPreference(state?.largeText ?? false)
      },
    },
  ),
)

