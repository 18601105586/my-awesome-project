const express = require('express')
const router = express.Router()
const db = require('../db')

// GET /api/columns - List all columns
router.get('/', (req, res) => {
  try {
    const columns = db.prepare('SELECT * FROM columns ORDER BY position ASC').all()
    res.json({ success: true, data: columns })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/columns - Create a new column
router.post('/', (req, res) => {
  try {
    const { name } = req.body

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Column name is required' })
    }

    // Get max position
    const maxPos = db.prepare('SELECT COALESCE(MAX(position), -1) as max FROM columns').get()
    const newPosition = maxPos.max + 1

    const stmt = db.prepare('INSERT INTO columns (name, position) VALUES (?, ?)')
    const result = stmt.run(name.trim(), newPosition)

    const column = db.prepare('SELECT * FROM columns WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json({ success: true, data: column })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/columns/:id - Get a column by ID
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid column ID' })
    }

    const column = db.prepare('SELECT * FROM columns WHERE id = ?').get(id)
    if (!column) {
      return res.status(404).json({ success: false, error: 'Column not found' })
    }

    res.json({ success: true, data: column })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/columns/:id - Update a column
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid column ID' })
    }

    const { name } = req.body
    const column = db.prepare('SELECT * FROM columns WHERE id = ?').get(id)

    if (!column) {
      return res.status(404).json({ success: false, error: 'Column not found' })
    }

    if (name && name.trim() !== '') {
      db.prepare('UPDATE columns SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(name.trim(), id)
    }

    const updated = db.prepare('SELECT * FROM columns WHERE id = ?').get(id)
    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PATCH /api/columns/:id - Reorder a column
router.patch('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { position } = req.body

    if (isNaN(id) || typeof position !== 'number') {
      return res.status(400).json({ success: false, error: 'Invalid request' })
    }

    const column = db.prepare('SELECT * FROM columns WHERE id = ?').get(id)
    if (!column) {
      return res.status(404).json({ success: false, error: 'Column not found' })
    }

    const oldPos = column.position

    // Simple swap approach
    if (position !== oldPos) {
      const other = db.prepare('SELECT * FROM columns WHERE position = ?').get(position)
      if (other) {
        db.prepare('UPDATE columns SET position = ? WHERE id = ?').run(oldPos, other.id)
      }
      db.prepare('UPDATE columns SET position = ? WHERE id = ?').run(position, id)
    }

    const updated = db.prepare('SELECT * FROM columns WHERE id = ?').get(id)
    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /api/columns/:id - Delete a column
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid column ID' })
    }

    const column = db.prepare('SELECT * FROM columns WHERE id = ?').get(id)
    if (!column) {
      return res.status(404).json({ success: false, error: 'Column not found' })
    }

    // Check if column has tasks
    const tasks = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE column_id = ?').get(id)
    if (tasks.count > 0) {
      return res.status(409).json({ success: false, error: 'Cannot delete column with tasks' })
    }

    db.prepare('DELETE FROM columns WHERE id = ?').run(id)
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
