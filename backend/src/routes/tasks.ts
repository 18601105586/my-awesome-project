import { Router } from 'express'
import {
  createTask,
  getTasks,
  getTask,
  getTasksByColumn,
  updateTask,
  moveTask,
  deleteTask
} from '../controllers/tasks'
import { getTaskSessions } from '../controllers/sessions'

const router = Router()

router.post('/', createTask)
router.get('/', getTasks)
router.get('/:id', getTask)
router.get('/:id/sessions', getTaskSessions)
router.get('/columns/:cid/tasks', getTasksByColumn)
router.put('/:id', updateTask)
router.patch('/:id', moveTask)
router.delete('/:id', deleteTask)

export default router
