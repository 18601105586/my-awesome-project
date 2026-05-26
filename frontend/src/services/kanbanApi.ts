import { api } from './api'
import type { Column, Task } from '../types'

export const kanbanApi = {
  // Columns
  async getColumns(): Promise<Column[]> {
    const response = await api.get('/columns')
    return response.data.data
  },

  async createColumn(name: string): Promise<Column> {
    const response = await api.post('/columns', { name })
    return response.data.data
  },

  async updateColumn(id: number, name: string): Promise<Column> {
    const response = await api.put(`/columns/${id}`, { name })
    return response.data.data
  },

  async deleteColumn(id: number): Promise<void> {
    await api.delete(`/columns/${id}`)
  },

  // Tasks
  async getTasks(): Promise<Task[]> {
    const response = await api.get('/tasks')
    return response.data.data
  },

  async getTasksByColumn(columnId: number): Promise<Task[]> {
    const response = await api.get(`/columns/${columnId}/tasks`)
    return response.data.data
  },

  async createTask(title: string, columnId: number, description?: string): Promise<Task> {
    const response = await api.post('/tasks', { title, columnId, description })
    return response.data.data
  },

  async updateTask(id: number, title?: string, description?: string): Promise<Task> {
    const response = await api.put(`/tasks/${id}`, { title, description })
    return response.data.data
  },

  async moveTask(id: number, columnId: number, position: number): Promise<Task> {
    const response = await api.patch(`/tasks/${id}`, { columnId, newPosition: position })
    return response.data.data
  },

  async deleteTask(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`)
  },
}
