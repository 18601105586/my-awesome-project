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
  const columnTasks = tasks.filter((t) => t.column_id === column.id)

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
      <button className="add-task-btn" onClick={handleAddTask}>
        + Add Task
      </button>
    </div>
  )
}
