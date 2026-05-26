import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/** Safely parse a route param as integer */
const paramInt = (val: unknown): number => parseInt(val as string, 10)

export const createArtifact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sessionId, taskId, type, name, path, language, content, version } = req.body

    if (!sessionId || !type || !name) {
      res.status(400).json({ success: false, error: 'sessionId, type, and name are required' })
      return
    }

    const artifact = await prisma.artifact.create({
      data: {
        sessionId,
        taskId: taskId || null,
        type,
        name,
        path: path || null,
        language: language || null,
        content: content || null,
        version: version || 1
      }
    })

    res.status(201).json({ success: true, data: artifact })
  } catch (error) {
    next(error)
  }
}

export const getArtifacts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sessionId, taskId, type } = req.query

    const where: any = {}
    if (sessionId) where.sessionId = parseInt(sessionId as string, 10)
    if (taskId) where.taskId = parseInt(taskId as string, 10)
    if (type) where.type = type

    const artifacts = await prisma.artifact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        session: true,
        task: true
      }
    })

    res.json({ success: true, data: artifacts })
  } catch (error) {
    next(error)
  }
}

export const getArtifact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params

    const artifact = await prisma.artifact.findUnique({
      where: { id: paramInt(id) },
      include: {
        session: true,
        task: true
      }
    })

    if (!artifact) {
      res.status(404).json({ success: false, error: 'Artifact not found' })
      return
    }

    res.json({ success: true, data: artifact })
  } catch (error) {
    next(error)
  }
}

export const getArtifactPreview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params

    const artifact = await prisma.artifact.findUnique({
      where: { id: paramInt(id) },
      select: {
        id: true,
        sessionId: true,
        taskId: true,
        type: true,
        name: true,
        path: true,
        language: true,
        version: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!artifact) {
      res.status(404).json({ success: false, error: 'Artifact not found' })
      return
    }

    res.json({ success: true, data: artifact })
  } catch (error) {
    next(error)
  }
}

export const updateArtifact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const { taskId, type, name, path, language, content, version } = req.body

    const artifact = await prisma.artifact.update({
      where: { id: paramInt(id) },
      data: {
        taskId: taskId !== undefined ? taskId : undefined,
        type: type !== undefined ? type : undefined,
        name: name !== undefined ? name : undefined,
        path: path !== undefined ? path : undefined,
        language: language !== undefined ? language : undefined,
        content: content !== undefined ? content : undefined,
        version: version !== undefined ? version : undefined
      }
    })

    res.json({ success: true, data: artifact })
  } catch (error) {
    next(error)
  }
}

export const deleteArtifact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params

    await prisma.artifact.delete({
      where: { id: paramInt(id) }
    })

    res.json({ success: true, data: null })
  } catch (error) {
    next(error)
  }
}
