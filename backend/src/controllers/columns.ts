import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/** Safely parse a route param as integer */
const paramInt = (val: unknown): number => parseInt(val as string, 10)

export const createColumn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name } = req.body

    if (!name) {
      res.status(400).json({ success: false, error: 'Name is required' })
      return
    }

    // Get next position
    const maxColumn = await prisma.column.findFirst({
      orderBy: { position: 'desc' }
    })
    const position = maxColumn ? maxColumn.position + 1 : 0

    const column = await prisma.column.create({
      data: { name, position }
    })

    res.status(201).json({ success: true, data: column })
  } catch (error) {
    next(error)
  }
}

export const getColumns = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const columns = await prisma.column.findMany({
      orderBy: { position: 'asc' },
      include: { tasks: { orderBy: { position: 'asc' } } }
    })
    res.json({ success: true, data: columns })
  } catch (error) {
    next(error)
  }
}

export const getColumn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const column = await prisma.column.findUnique({
      where: { id: paramInt(id) },
      include: { tasks: { orderBy: { position: 'asc' } } }
    })

    if (!column) {
      res.status(404).json({ success: false, error: 'Column not found' })
      return
    }

    res.json({ success: true, data: column })
  } catch (error) {
    next(error)
  }
}

export const updateColumn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const { name } = req.body

    const column = await prisma.column.update({
      where: { id: paramInt(id) },
      data: { name }
    })

    res.json({ success: true, data: column })
  } catch (error) {
    next(error)
  }
}

export const reorderColumn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const { new_position } = req.body
    const columnId = paramInt(id)

    const column = await prisma.column.findUnique({
      where: { id: columnId }
    })

    if (!column) {
      res.status(404).json({ success: false, error: 'Column not found' })
      return
    }

    const oldPos = column.position
    const newPos = new_position

    if (oldPos !== newPos) {
      // Use transaction to update positions
      await prisma.$transaction(async (tx) => {
        if (newPos > oldPos) {
          // Moving down: shift positions between old and new up
          await tx.column.updateMany({
            where: {
              position: {
                gte: oldPos,
                lte: newPos
              }
            },
            data: {
              position: {
                decrement: 1
              }
            }
          })
        } else {
          // Moving up: shift positions between new and old down
          await tx.column.updateMany({
            where: {
              position: {
                gte: newPos,
                lte: oldPos
              }
            },
            data: {
              position: {
                increment: 1
              }
            }
          })
        }

        await tx.column.update({
          where: { id: columnId },
          data: { position: newPos }
        })
      })
    }

    const updatedColumn = await prisma.column.findUnique({
      where: { id: columnId }
    })

    res.json({ success: true, data: updatedColumn })
  } catch (error) {
    next(error)
  }
}

export const deleteColumn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params

    await prisma.column.delete({
      where: { id: paramInt(id) }
    })

    res.json({ success: true, data: null })
  } catch (error) {
    next(error)
  }
}
