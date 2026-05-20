import { useKanbanStore } from '../../stores/kanbanStore'
import type { Column } from '../../types'
import TaskCard from '../TaskCard/TaskCard'
import './Column.css'

interface ColumnProps {
  column: Column
}

export default function Column({ column }: ColumnProps) {
  const { tasks, deleteColumn, updateColumn } = useKanbanStore()
  const columnTasks = tasks.filter((t) => t.column_id === column.id)

  const handleRename = () => {
    const name = prompt('Column name:', column.name)
    if (name && name !== column.name) {
      updateColumn(column.id, name)
    }
  }

  const handleAddTask = () => {
    const title = prompt('Task title:')
    if (title) {
      const desc = prompt('Description (optional):')
      useKanbanStore.getState().addTask(title, column.id, desc || undefined)
    }
  }

  return (
    <div className="column">
      <div className="column-header">
        <h3 onClick={handleRename} title="Click to rename">{column.name}</h3>
        <button className="delete-btn" onClick={() => deleteColumn(column.id)}>×</button>
      </div>
      <div className="column-tasks">
        {columnTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
      <button className="add-task-btn" onClick={handleAddTask}>
        + Add Task
      </button>
    </div>
  )
}
