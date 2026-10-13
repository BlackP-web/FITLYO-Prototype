import { http, HttpResponse } from 'msw'
import type { UserProfile, WorkoutPlan } from '@/types'

const mockUser: UserProfile = {
  id: 'usr_001',
  name: 'Alex Johnson',
  email: 'alex.johnson@fitlyo.com',
  role: 'member',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  fitnessGoal: 'Tăng cơ giảm mỡ (Hypertrophy)',
  currentWeight: 72.5,
  targetWeight: 68.0,
}

const mockWorkouts: WorkoutPlan[] = [
  {
    id: 'wk_01',
    title: 'Full Body HIIT Blast',
    category: 'HIIT',
    durationMinutes: 45,
    level: 'Intermediate',
    exercisesCount: 8,
  },
  {
    id: 'wk_02',
    title: 'Upper Body Power & Hypertrophy',
    category: 'Strength',
    durationMinutes: 60,
    level: 'Advanced',
    exercisesCount: 6,
  },
  {
    id: 'wk_03',
    title: 'Morning Flow & Core Recovery',
    category: 'Yoga',
    durationMinutes: 30,
    level: 'Beginner',
    exercisesCount: 10,
  },
  {
    id: 'wk_04',
    title: 'Leg Day & Glutes Sculpt',
    category: 'Strength',
    durationMinutes: 50,
    level: 'Intermediate',
    exercisesCount: 7,
  },
]

export const handlers = [
  // Lấy thông tin user hiện tại
  http.get('/api/user/profile', () => {
    return HttpResponse.json(mockUser)
  }),

  // Cập nhật profile
  http.put('/api/user/profile', async ({ request }) => {
    const updated = (await request.json()) as Partial<UserProfile>
    Object.assign(mockUser, updated)
    return HttpResponse.json(mockUser)
  }),

  // Lấy danh sách bài tập
  http.get('/api/workouts', () => {
    return HttpResponse.json(mockWorkouts)
  }),

  // Tạo kế hoạch tập mới
  http.post('/api/workouts', async ({ request }) => {
    const newWorkout = (await request.json()) as Omit<WorkoutPlan, 'id'>
    const created: WorkoutPlan = {
      ...newWorkout,
      id: `wk_${Date.now()}`,
    }
    mockWorkouts.unshift(created)
    return HttpResponse.json(created, { status: 201 })
  }),
]
