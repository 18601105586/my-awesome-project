import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/** Safely parse a route param as integer */
const paramInt = (val: unknown): number => parseInt(val as string, 10)

export const createSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, phase, taskId, summary, metadata } = req.body

    if (!title) {
      res.status(400).json({ success: false, error: 'Title is required' })
      return
    }

    const session = await prisma.aISession.create({
      data: {
        title,
        phase: phase || 'implementation',
        taskId: taskId || null,
        summary: summary || null,
        metadata: metadata || null
      },
      include: {
        task: true
      }
    })

    res.status(201).json({ success: true, data: session })
  } catch (error) {
    next(error)
  }
}

export const getSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phase, taskId } = req.query

    const where: any = {}
    if (phase) where.phase = phase
    if (taskId) where.taskId = parseInt(taskId as string, 10)

    const sessions = await prisma.aISession.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        task: true,
        skillCalls: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        artifacts: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    res.json({ success: true, data: sessions })
  } catch (error) {
    next(error)
  }
}

export const getSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params

    const session = await prisma.aISession.findUnique({
      where: { id: paramInt(id) },
      include: {
        task: true,
        skillCalls: {
          orderBy: { createdAt: 'asc' }
        },
        artifacts: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' })
      return
    }

    res.json({ success: true, data: session })
  } catch (error) {
    next(error)
  }
}

export const updateSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const { title, phase, taskId, summary, completed, metadata } = req.body

    const session = await prisma.aISession.update({
      where: { id: paramInt(id) },
      data: {
        title: title !== undefined ? title : undefined,
        phase: phase !== undefined ? phase : undefined,
        taskId: taskId !== undefined ? taskId : undefined,
        summary: summary !== undefined ? summary : undefined,
        completed: completed !== undefined ? completed : undefined,
        metadata: metadata !== undefined ? metadata : undefined
      },
      include: {
        task: true
      }
    })

    res.json({ success: true, data: session })
  } catch (error) {
    next(error)
  }
}

export const deleteSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params

    await prisma.aISession.delete({
      where: { id: paramInt(id) }
    })

    res.json({ success: true, data: null })
  } catch (error) {
    next(error)
  }
}

export const getSessionSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params

    const skills = await prisma.skillCall.findMany({
      where: { sessionId: paramInt(id) },
      orderBy: { createdAt: 'asc' }
    })

    res.json({ success: true, data: skills })
  } catch (error) {
    next(error)
  }
}

export const getTaskSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params

    const sessions = await prisma.aISession.findMany({
      where: { taskId: paramInt(id) },
      orderBy: { createdAt: 'desc' },
      include: {
        skillCalls: {
          orderBy: { createdAt: 'desc' },
          take: 3
        },
        artifacts: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      }
    })

    res.json({ success: true, data: sessions })
  } catch (error) {
    next(error)
  }
}
