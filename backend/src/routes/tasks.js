const express = require('express')
const router = express.Router()
const db = require('../db')

// GET /api/tasks - List all tasks
router.get('/', (req, res) => {
  try {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY column_id, position ASC').all()
    res.json({ success: true, data: tasks })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/tasks - Create a new task
router.post('/', (req, res) => {
  try {
    const { title, description, column_id } = req.body

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, error: 'Task title is required' })
    }

    if (!column_id) {
      return res.status(400).json({ success: false, error: 'Column ID is required' })
    }

    // Check column exists
    const column = db.prepare('SELECT * FROM columns WHERE id = ?').get(column_id)
    if (!column) {
      return res.status(400).json({ success: false, error: 'Invalid column ID' })
    }

    // Get max position in column
    const maxPos = db.prepare('SELECT COALESCE(MAX(position), -1) as max FROM tasks WHERE column_id = ?').get(column_id)
    const newPosition = maxPos.max + 1

    const stmt = db.prepare('INSERT INTO tasks (title, description, column_id, position) VALUES (?, ?, ?, ?)')
    const result = stmt.run(title.trim(), description || null, column_id, newPosition)

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json({ success: true, data: task })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/tasks/:id - Get a task by ID
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid task ID' })
    }

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    res.json({ success: true, data: task })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/columns/:cid/tasks - List tasks in a column
router.get('/columns/:cid/tasks', (req, res) => {
  try {
    const cid = parseInt(req.params.cid)
    if (isNaN(cid)) {
      return res.status(400).json({ success: false, error: 'Invalid column ID' })
    }

    const tasks = db.prepare('SELECT * FROM tasks WHERE column_id = ? ORDER BY position ASC').all(cid)
    res.json({ success: true, data: tasks })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/tasks/:id - Update a task
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid task ID' })
    }

    const { title, description } = req.body
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    if (title !== undefined) {
      db.prepare('UPDATE tasks SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(title.trim(), id)
    }
    if (description !== undefined) {
      db.prepare('UPDATE tasks SET description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(description, id)
    }

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PATCH /api/tasks/:id - Move task to different column
router.patch('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { column_id, position } = req.body

    if (isNaN(id) || !column_id || typeof position !== 'number') {
      return res.status(400).json({ success: false, error: 'Invalid request' })
    }

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    // Check new column exists
    const column = db.prepare('SELECT * FROM columns WHERE id = ?').get(column_id)
    if (!column) {
      return res.status(400).json({ success: false, error: 'Invalid column ID' })
    }

    // Move task
    db.prepare('UPDATE tasks SET column_id = ?, position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(column_id, position, id)

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid task ID' })
    }

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
