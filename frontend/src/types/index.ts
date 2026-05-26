export interface Column {
  id: number
  name: string
  position: number
  createdAt: string
  updatedAt: string
  tasks?: Task[]
}

export interface Task {
  id: number
  title: string
  description: string
  columnId: number
  position: number
  phase?: string
  createdAt: string
  updatedAt: string
  column?: Column
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}
