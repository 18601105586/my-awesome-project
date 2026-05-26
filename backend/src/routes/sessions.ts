import { Router } from 'express'
import {
  createSession,
  getSessions,
  getSession,
  updateSession,
  deleteSession,
  getSessionSkills,
  getTaskSessions
} from '../controllers/sessions'

const router = Router()

router.post('/', createSession)
router.get('/', getSessions)
router.get('/:id', getSession)
router.put('/:id', updateSession)
router.delete('/:id', deleteSession)
router.get('/:id/skills', getSessionSkills)

export default router
