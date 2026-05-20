import { useKanbanStore } from '../../stores/kanbanStore'
import type { Task } from '../../types'
import './TaskCard.css'

interface TaskCardProps {
  task: Task
}

export default function TaskCard({ task }: TaskCardProps) {
  const { updateTask, deleteTask } = useKanbanStore()

  const handleEdit = () => {
    const title = prompt('Task title:', task.title)
    if (title && title !== task.title) {
      updateTask(task.id, title)
    }
  }

  const handleDelete = () => {
    if (confirm('Delete this task?')) {
      deleteTask(task.id)
    }
  }

  return (
    <div className="task-card">
      <div className="task-title">{task.title}</div>
      {task.description && <div className="task-desc">{task.description}</div>}
      <div className="task-actions">
        <button onClick={handleEdit}>Edit</button>
        <button onClick={handleDelete}>Delete</button>
      </div>
    </div>
  )
}
