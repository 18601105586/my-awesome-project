import { create } from 'zustand'
import { kanbanApi } from '../services/kanbanApi'
import type { Column, Task } from '../types'

interface KanbanState {
  columns: Column[]
  tasks: Task[]
  isLoading: boolean
  error: string | null

  // Actions
  loadColumns: () => Promise<void>
  loadTasks: () => Promise<void>
  addColumn: (name: string) => Promise<void>
  updateColumn: (id: number, name: string) => Promise<void>
  deleteColumn: (id: number) => Promise<void>
  addTask: (title: string, columnId: number, description?: string) => Promise<void>
  updateTask: (id: number, title?: string, description?: string) => Promise<void>
  moveTask: (taskId: number, columnId: number, position: number) => Promise<void>
  deleteTask: (id: number) => Promise<void>
}

export const useKanbanStore = create<KanbanState>((set) => ({
  columns: [],
  tasks: [],
  isLoading: false,
  error: null,

  loadColumns: async () => {
    try {
      set({ isLoading: true, error: null })
      const columns = await kanbanApi.getColumns()
      set({ columns, isLoading: false })
    } catch (err) {
      set({ error: handleApiError(err), isLoading: false })
    }
  },

  loadTasks: async () => {
    try {
      set({ isLoading: true, error: null })
      const tasks = await kanbanApi.getTasks()
      set({ tasks, isLoading: false })
    } catch (err) {
      set({ error: handleApiError(err), isLoading: false })
    }
  },

  addColumn: async (name: string) => {
    const column = await kanbanApi.createColumn(name)
    set((state) => ({ columns: [...state.columns, column] }))
  },

  updateColumn: async (id: number, name: string) => {
    const updated = await kanbanApi.updateColumn(id, name)
    set((state) => ({
      columns: state.columns.map((c) => (c.id === id ? updated : c)),
    }))
  },

  deleteColumn: async (id: number) => {
    await kanbanApi.deleteColumn(id)
    set((state) => ({ columns: state.columns.filter((c) => c.id !== id) }))
  },

  addTask: async (title: string, columnId: number, description?: string) => {
    const task = await kanbanApi.createTask(title, columnId, description)
    set((state) => ({ tasks: [...state.tasks, task] }))
  },

  updateTask: async (id: number, title?: string, description?: string) => {
    const updated = await kanbanApi.updateTask(id, title, description)
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
    }))
  },

  moveTask: async (taskId: number, columnId: number, position: number) => {
    const updated = await kanbanApi.moveTask(taskId, columnId, position)
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? updated : t)),
    }))
  },

  deleteTask: async (id: number) => {
    await kanbanApi.deleteTask(id)
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
  },
}))

function handleApiError(err: unknown): string {
  if (err instanceof Error) {
    return err.message
  }
  return 'An unknown error occurred'
}
