export interface UserProfile {
  id: string
  name: string
  email: string
  role: 'member' | 'trainer' | 'admin'
  avatarUrl?: string
  fitnessGoal: string
  currentWeight: number
  targetWeight: number
}

export interface WorkoutPlan {
  id: string
  title: string
  category: 'Strength' | 'Cardio' | 'HIIT' | 'Yoga' | 'Pilates'
  durationMinutes: number
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  exercisesCount: number
  imageUrl?: string
}

export interface NutritionLog {
  id: string
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'
  calories: number
  protein: number
  carbs: number
  fat: number
  loggedAt: string
}
