import crypto from 'crypto'

export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = await import('bcryptjs')
  return bcrypt.hash(password, 12)
}

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  const bcrypt = await import('bcryptjs')
  return bcrypt.compare(password, hash)
}

export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const createAuditHash = (prevHash: string | null, data: object): string => {
  const content = (prevHash || '') + JSON.stringify(data)
  return crypto.createHash('sha256').update(content).digest('hex')
}