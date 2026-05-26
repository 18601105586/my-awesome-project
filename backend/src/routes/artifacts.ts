import { Router } from 'express'
import {
  createArtifact,
  getArtifacts,
  getArtifact,
  getArtifactPreview,
  updateArtifact,
  deleteArtifact
} from '../controllers/artifacts'

const router = Router()

router.post('/', createArtifact)
router.get('/', getArtifacts)
router.get('/:id', getArtifact)
router.get('/:id/preview', getArtifactPreview)
router.put('/:id', updateArtifact)
router.delete('/:id', deleteArtifact)

export default router
