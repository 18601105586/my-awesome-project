import { Router } from 'express'
import {
  createColumn,
  getColumns,
  getColumn,
  updateColumn,
  reorderColumn,
  deleteColumn
} from '../controllers/columns'

const router = Router()

router.post('/', createColumn)
router.get('/', getColumns)
router.get('/:id', getColumn)
router.put('/:id', updateColumn)
router.patch('/:id', reorderColumn)
router.delete('/:id', deleteColumn)

export default router
