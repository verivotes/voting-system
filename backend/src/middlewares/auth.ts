import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = verifyAccessToken(token)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' })
    }
    next()
  }
}
module.exports = { authenticate, authorize }