import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useKanbanStore } from '../../stores/kanbanStore'
import type { Column } from '../../types'
import TaskCard from '../TaskCard/TaskCard'
import './Column.css'

interface ColumnProps {
  column: Column
}

export default function Column({ column }: ColumnProps) {
  const { tasks, deleteColumn, updateColumn, moveTask } = useKanbanStore()
  const [showInput, setShowInput] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const columnTasks = tasks.filter((t) => t.columnId === column.id)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const taskId = Number(active.id)
      const targetTask = columnTasks.find((t) => t.id === Number(over.id))
      if (targetTask) {
        const newPosition = columnTasks.indexOf(targetTask)
        moveTask(taskId, column.id, newPosition)
      } else {
        moveTask(taskId, column.id, columnTasks.length)
      }
    }
  }

  const handleAddTask = () => {
    if (!newTitle.trim()) return
    useKanbanStore.getState().addTask(newTitle.trim(), column.id, newDesc.trim() || undefined)
    setNewTitle('')
    setNewDesc('')
    setShowInput(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddTask()
    }
    if (e.key === 'Escape') {
      setShowInput(false)
      setNewTitle('')
      setNewDesc('')
    }
  }

  return (
    <div className="column">
      <div className="column-header">
        <h3 title="Click to rename">
          {column.name}
          <span className="column-count">{columnTasks.length}</span>
        </h3>
        <button className="delete-btn" onClick={() => deleteColumn(column.id)}>×</button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={columnTasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="column-tasks">
            {columnTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {showInput ? (
        <div className="add-task-form">
          <input
            className="add-task-input"
            placeholder="Task title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <input
            className="add-task-input add-task-desc"
            placeholder="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="add-task-actions">
            <button className="add-task-submit" onClick={handleAddTask}>Add</button>
            <button className="add-task-cancel" onClick={() => { setShowInput(false); setNewTitle(''); setNewDesc('') }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button className="add-task-btn" onClick={() => setShowInput(true)}>
          + Add Task
        </button>
      )}
    </div>
  )
}
