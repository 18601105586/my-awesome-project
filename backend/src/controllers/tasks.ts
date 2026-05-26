import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/** Safely parse a route param as integer */
const paramInt = (val: unknown): number => parseInt(val as string, 10)

export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, columnId } = req.body

    if (!title || !columnId) {
      res.status(400).json({ success: false, error: 'Title and columnId are required' })
      return
    }

    // Get next position in column
    const maxTask = await prisma.task.findFirst({
      where: { columnId: columnId },
      orderBy: { position: 'desc' }
    })
    const position = maxTask ? maxTask.position + 1 : 0

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        columnId: columnId,
        position
      },
      include: { column: true }
    })

    res.status(201).json({ success: true, data: task })
  } catch (error) {
    next(error)
  }
}

export const getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phase, columnId } = req.query

    const where: any = {}
    if (phase) where.phase = phase
    if (columnId) where.columnId = parseInt(columnId as string, 10)

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ columnId: 'asc' }, { position: 'asc' }],
      include: { column: true }
    })
    res.json({ success: true, data: tasks })
  } catch (error) {
    next(error)
  }
}

export const getTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const task = await prisma.task.findUnique({
      where: { id: paramInt(id) },
      include: { column: true }
    })

    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' })
      return
    }

    res.json({ success: true, data: task })
  } catch (error) {
    next(error)
  }
}

export const getTasksByColumn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { cid } = req.params
    const tasks = await prisma.task.findMany({
      where: { columnId: paramInt(cid) },
      orderBy: { position: 'asc' },
      include: { column: true }
    })
    res.json({ success: true, data: tasks })
  } catch (error) {
    next(error)
  }
}

export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const { title, description, phase } = req.body

    const task = await prisma.task.update({
      where: { id: paramInt(id) },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        phase: phase !== undefined ? phase : undefined
      },
      include: { column: true }
    })

    res.json({ success: true, data: task })
  } catch (error) {
    next(error)
  }
}

export const moveTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const { columnId, newPosition } = req.body
    const taskId = paramInt(id)

    const task = await prisma.task.findUnique({
      where: { id: taskId }
    })

    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' })
      return
    }

    const oldColumnId = task.columnId
    const oldPosition = task.position
    const newColumnId = paramInt(columnId)
    const newPos = paramInt(newPosition)

    // Use transaction to handle position updates
    await prisma.$transaction(async (tx) => {
      // If moving to a different column
      if (newColumnId !== oldColumnId) {
        // Shift tasks in target column
        if (newPos >= 0) {
          await tx.task.updateMany({
            where: {
              columnId: newColumnId,
              position: { gte: newPos }
            },
            data: { position: { increment: 1 } }
          })
        }

        // Update the task
        await tx.task.update({
          where: { id: taskId },
          data: {
            columnId: newColumnId,
            position: newPos
          }
        })
      } else {
        // Same column, just reordering
        if (newPos > oldPosition) {
          // Moving down: shift tasks between old and new up
          await tx.task.updateMany({
            where: {
              columnId: newColumnId,
              position: {
                gte: oldPosition,
                lte: newPos
              }
            },
            data: { position: { decrement: 1 } }
          })
        } else if (newPos < oldPosition) {
          // Moving up: shift tasks between new and old down
          await tx.task.updateMany({
            where: {
              columnId: newColumnId,
              position: {
                gte: newPos,
                lte: oldPosition
              }
            },
            data: { position: { increment: 1 } }
          })
        }

        await tx.task.update({
          where: { id: taskId },
          data: { position: newPos }
        })
      }
    })

    const updatedTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: { column: true }
    })

    res.json({ success: true, data: updatedTask })
  } catch (error) {
    next(error)
  }
}

export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params

    await prisma.task.delete({
      where: { id: paramInt(id) }
    })

    res.json({ success: true, data: null })
  } catch (error) {
    next(error)
  }
}
