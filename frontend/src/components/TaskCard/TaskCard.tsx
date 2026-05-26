import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useKanbanStore } from '../../stores/kanbanStore'
import type { Task } from '../../types'
import './TaskCard.css'

interface TaskCardProps {
  task: Task
}

export default function TaskCard({ task }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const { updateTask, deleteTask } = useKanbanStore()
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDesc, setEditDesc] = useState(task.description || '')

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleSave = () => {
    if (!editTitle.trim()) return
    updateTask(task.id, editTitle.trim(), editDesc.trim() || undefined)
    setEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(task.title)
    setEditDesc(task.description || '')
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (editing) {
    return (
      <div className="task-card-editing">
        <input
          className="task-edit-input"
          placeholder="Task title"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <input
          className="task-edit-input task-edit-desc"
          placeholder="Description (optional)"
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="task-edit-actions">
          <button className="task-edit-save" onClick={handleSave}>Save</button>
          <button className="task-edit-cancel" onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`task-card ${isDragging ? 'sortable-drag' : ''}`}
    >
      <div className="task-title">{task.title}</div>
      {task.description && <div className="task-desc">{task.description}</div>}
      <div className="task-actions">
        <button onClick={(e) => { e.stopPropagation(); setEditing(true) }}>Edit</button>
        <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id) }}>Delete</button>
      </div>
    </div>
  )
}
