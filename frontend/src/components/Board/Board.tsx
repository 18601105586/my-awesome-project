import { useState, useEffect, useRef } from 'react'
import { useKanbanStore } from '../../stores/kanbanStore'
import Column from '../Column/Column'
import './Board.css'

export default function Board() {
  const { columns, loadColumns, loadTasks, addColumn } = useKanbanStore()
  const [showInput, setShowInput] = useState(false)
  const [newName, setNewName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadColumns()
    loadTasks()
  }, [])

  useEffect(() => {
    if (showInput) inputRef.current?.focus()
  }, [showInput])

  const handleAddColumn = () => {
    if (!newName.trim()) return
    addColumn(newName.trim())
    setNewName('')
    setShowInput(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddColumn()
    }
    if (e.key === 'Escape') {
      setShowInput(false)
      setNewName('')
    }
  }

  return (
    <div className="board">
      {columns.map((column) => (
        <Column key={column.id} column={column} />
      ))}
      {showInput ? (
        <div className="add-column-form">
          <input
            ref={inputRef}
            className="add-column-input"
            placeholder="Column name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="add-column-actions">
            <button className="add-column-submit" onClick={handleAddColumn}>Add</button>
            <button className="add-column-cancel" onClick={() => { setShowInput(false); setNewName('') }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button className="add-column-btn" onClick={() => setShowInput(true)}>
          + Add Column
        </button>
      )}
    </div>
  )
}
