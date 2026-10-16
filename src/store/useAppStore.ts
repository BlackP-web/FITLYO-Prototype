import { create } from 'zustand'
import type { UserProfile, WorkoutPlan } from '@/types'

interface AppState {
  user: UserProfile | null
  workouts: WorkoutPlan[]
  isLoadingUser: boolean
  isSidebarOpen: boolean
  notificationCount: number

  // Actions
  setUser: (user: UserProfile | null) => void
  setWorkouts: (workouts: WorkoutPlan[]) => void
  addWorkout: (workout: WorkoutPlan) => void
  toggleSidebar: () => void
  fetchUserProfile: () => Promise<void>
  fetchWorkouts: () => Promise<void>
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  workouts: [],
  isLoadingUser: false,
  isSidebarOpen: true,
  notificationCount: 3,

  setUser: (user) => set({ user }),
  setWorkouts: (workouts) => set({ workouts }),
  addWorkout: (workout) =>
    set((state) => ({ workouts: [workout, ...state.workouts] })),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  fetchUserProfile: async () => {
    set({ isLoadingUser: true })
    try {
      const res = await fetch('/api/user/profile')
      if (res.ok) {
        const data = await res.json()
        set({ user: data })
      }
    } catch (err) {
      console.error('Failed to fetch profile', err)
    } finally {
      set({ isLoadingUser: false })
    }
  },

  fetchWorkouts: async () => {
    try {
      const res = await fetch('/api/workouts')
      if (res.ok) {
        const data = await res.json()
        set({ workouts: data })
      }
    } catch (err) {
      console.error('Failed to fetch workouts', err)
    }
  },
}))
