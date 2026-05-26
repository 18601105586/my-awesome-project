import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/** Safely parse a route param as integer */
const paramInt = (val: unknown): number => parseInt(val as string, 10)

export const createSkillCall = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sessionId, skill, input, output, durationMs, status, error: errorMessage } = req.body

    if (!sessionId || !skill) {
      res.status(400).json({ success: false, error: 'sessionId and skill are required' })
      return
    }

    const skillCall = await prisma.skillCall.create({
      data: {
        sessionId,
        skill,
        input: input || null,
        output: output || null,
        durationMs: durationMs || null,
        status: status || 'success',
        error: errorMessage || null
      }
    })

    res.status(201).json({ success: true, data: skillCall })
  } catch (error) {
    next(error)
  }
}

export const getSkillCalls = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sessionId, skill } = req.query

    const where: any = {}
    if (sessionId) where.sessionId = parseInt(sessionId as string, 10)
    if (skill) where.skill = skill

    const skillCalls = await prisma.skillCall.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        session: true
      }
    })

    res.json({ success: true, data: skillCalls })
  } catch (error) {
    next(error)
  }
}

export const getSkillCall = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params

    const skillCall = await prisma.skillCall.findUnique({
      where: { id: paramInt(id) },
      include: {
        session: true
      }
    })

    if (!skillCall) {
      res.status(404).json({ success: false, error: 'Skill call not found' })
      return
    }

    res.json({ success: true, data: skillCall })
  } catch (error) {
    next(error)
  }
}

export const deleteSkillCall = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params

    await prisma.skillCall.delete({
      where: { id: paramInt(id) }
    })

    res.json({ success: true, data: null })
  } catch (error) {
    next(error)
  }
}

export const getSkillStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { from, to } = req.query

    const where: any = {}
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from as string)
      if (to) where.createdAt.lte = new Date(to as string)
    }

    const skillCalls = await prisma.skillCall.findMany({
      where,
      select: {
        skill: true
      }
    })

    const stats: Record<string, number> = {}
    for (const call of skillCalls) {
      stats[call.skill] = (stats[call.skill] || 0) + 1
    }

    res.json({ success: true, data: stats })
  } catch (error) {
    next(error)
  }
}
