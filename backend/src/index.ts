import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import columnRoutes from './routes/columns'
import taskRoutes from './routes/tasks'
import sessionRoutes from './routes/sessions'
import skillCallRoutes from './routes/skill-calls'
import artifactRoutes from './routes/artifacts'
import pipelineEventRoutes from './routes/pipeline-events'

export const prisma = new PrismaClient()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/columns', columnRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/skill-calls', skillCallRoutes)
app.use('/api/artifacts', artifactRoutes)
app.use('/api', pipelineEventRoutes)

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
