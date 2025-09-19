export interface GetCategoriesResponse {
  success: boolean
  message: string
  data: string[]
}

export interface Training {
  id: number
  brand_id: number
  brand_name: string
  name: string
  description: string | null
  content_url: string
  category: string
  average_rating: string
  position: number
  created_at: string
  progress: string
}

export interface TrainingsListData {
  list: Training[]
  meta: {
    current_page: number
    last_page: number
    total_items: number
    pagesize: number
  }
}

export interface GetTrainingsResponse {
  success: boolean
  message: string
  data: TrainingsListData
}

export interface TrainingProgress {
  trainingId: string
  completed: boolean
  progress: number
  completedLessons: number
  totalLessons: number
  lastAccessed?: string
}

export interface AcademyStats {
  totalTrainings: number
  completedTrainings: number
  totalCategories: number
  totalHours: number
  completedHours: number
}