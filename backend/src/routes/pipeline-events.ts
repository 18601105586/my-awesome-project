import { Router } from 'express'
import { webhookAuth, createPipelineEvent, getPipelineEvents, getPipelineStats } from '../controllers/pipeline-events'

const router = Router()

// Webhook endpoint requires authentication
router.post('/pipeline', webhookAuth, createPipelineEvent)

// Public endpoints for viewing events
router.get('/pipeline-events', getPipelineEvents)
router.get('/pipeline-events/stats', getPipelineStats)

export default router
