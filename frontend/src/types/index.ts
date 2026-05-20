export interface Column {
  id: number
  name: string
  position: number
  created_at: string
  updated_at: string
  tasks?: Task[]
}

export interface Task {
  id: number
  title: string
  description: string
  column_id: number
  position: number
  created_at: string
  updated_at: string
  column?: Column
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}
