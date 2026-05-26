import { Router } from 'express'
import {
  createSkillCall,
  getSkillCalls,
  getSkillCall,
  deleteSkillCall,
  getSkillStats
} from '../controllers/skill-calls'

const router = Router()

router.post('/', createSkillCall)
router.get('/', getSkillCalls)
router.get('/stats', getSkillStats)
router.get('/:id', getSkillCall)
router.delete('/:id', deleteSkillCall)

export default router
