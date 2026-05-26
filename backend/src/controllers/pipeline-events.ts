import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/** Safely parse a route param as integer */
const paramInt = (val: unknown): number => parseInt(val as string, 10)

// Webhook token for authentication (configure via environment variable)
const WEBHOOK_TOKEN = process.env.WEBHOOK_TOKEN || 'webhook-secret-change-in-production'

export const webhookAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers['x-webhook-token'] as string

  if (!token || token !== WEBHOOK_TOKEN) {
    res.status(401).json({ success: false, error: 'Unauthorized' })
    return
  }

  next()
}

export const createPipelineEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, status, author, message, sha, durationMs, error: errorMessage, metadata } = req.body

    if (!type) {
      res.status(400).json({ success: false, error: 'type is required' })
      return
    }

    const event = await prisma.pipelineEvent.create({
      data: {
        type,
        status: status || 'running',
        author: author || null,
        message: message || null,
        sha: sha || null,
        durationMs: durationMs || null,
        error: errorMessage || null,
        metadata: metadata || null
      }
    })

    res.status(201).json({ success: true, data: event })
  } catch (error) {
    next(error)
  }
}

export const getPipelineEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, status } = req.query

    const where: any = {}
    if (type) where.type = type
    if (status) where.status = status

    const events = await prisma.pipelineEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    res.json({ success: true, data: events })
  } catch (error) {
    next(error)
  }
}

export const getPipelineStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { from, to } = req.query

    const where: any = {}
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from as string)
      if (to) where.createdAt.lte = new Date(to as string)
    }

    const events = await prisma.pipelineEvent.findMany({
      where,
      select: {
        type: true,
        status: true,
        durationMs: true
      }
    })

    const stats = {
      total_commits: 0,
      builds: { success: 0, failed: 0, running: 0 },
      tests: { success: 0, failed: 0, running: 0 },
      deploys: { success: 0, failed: 0, running: 0 },
      avg_build_time_ms: 0
    }

    let totalBuildTime = 0
    let buildCount = 0

    for (const event of events) {
      if (event.type === 'commit') {
        stats.total_commits++
      } else if (event.type === 'build') {
        buildCount++
        if (event.durationMs) {
          totalBuildTime += event.durationMs
        }
        if (event.status === 'success') stats.builds.success++
        else if (event.status === 'failed') stats.builds.failed++
        else if (event.status === 'running') stats.builds.running++
      } else if (event.type === 'test') {
        if (event.status === 'success') stats.tests.success++
        else if (event.status === 'failed') stats.tests.failed++
        else if (event.status === 'running') stats.tests.running++
      } else if (event.type === 'deploy') {
        if (event.status === 'success') stats.deploys.success++
        else if (event.status === 'failed') stats.deploys.failed++
        else if (event.status === 'running') stats.deploys.running++
      }
    }

    stats.avg_build_time_ms = buildCount > 0 ? Math.round(totalBuildTime / buildCount) : 0

    res.json({ success: true, data: stats })
  } catch (error) {
    next(error)
  }
}
