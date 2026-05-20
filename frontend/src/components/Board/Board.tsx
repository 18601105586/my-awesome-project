import { useEffect } from 'react'
import { useKanbanStore } from '../../stores/kanbanStore'
import Column from '../Column/Column'
import './Board.css'

export default function Board() {
  const { columns, loadColumns, loadTasks, addColumn } = useKanbanStore()

  useEffect(() => {
    loadColumns()
    loadTasks()
  }, [])

  const handleAddColumn = () => {
    const name = prompt('Column name:')
    if (name) addColumn(name)
  }

  return (
    <div className="board">
      {columns.map((column) => (
        <Column key={column.id} column={column} />
      ))}
      <button className="add-column-btn" onClick={handleAddColumn}>
        + Add Column
      </button>
    </div>
  )
}
