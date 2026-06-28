import prisma from '../utils/prisma'
import { hashPassword, comparePassword, generateOtp } from '../utils/hash'
import { generateAccessToken, generateRefreshToken } from '../utils/jwt'
const { sendOtpEmail } = require('./emailService')
import { OtpPurpose } from '@prisma/client'

export async function registerUser(email: string, password: string, fullName: string) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error('Email already registered')

  const passwordHash = await hashPassword(password)

  // Auto-verify on creation — no OTP required to login
  const user = await prisma.user.create({
    data: { email, passwordHash, fullName, isVerified: true }
  })

  // Generate OTP and send welcome/confirmation email (non-blocking)
  const otp = generateOtp()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await prisma.otpToken.create({
    data: {
      userId: user.id,
      token: otp,
      purpose: OtpPurpose.EMAIL_VERIFICATION,
      expiresAt
    }
  })

  // Send email in background — don't block registration
  sendOtpEmail(email, otp, fullName).catch((err: any) => {
    console.error('Email send failed (non-blocking):', err.message)
  })

  return { user, otp }
}

export async function verifyOtp(email: string, token: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('User not found')

  const otp = await prisma.otpToken.findFirst({
    where: {
      userId: user.id,
      token,
      purpose: OtpPurpose.EMAIL_VERIFICATION,
      used: false,
      expiresAt: { gt: new Date() }
    }
  })

  if (!otp) throw new Error('Invalid or expired OTP')

  await prisma.otpToken.update({ where: { id: otp.id }, data: { used: true } })
  await prisma.user.update({ where: { id: user.id }, data: { isVerified: true } })

  return { message: 'Email verified successfully' }
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('Invalid credentials')


  const valid = await comparePassword(password, user.passwordHash)
  if (!valid) throw new Error('Invalid credentials')

  const accessToken = generateAccessToken(user.id, user.role)
  const refreshToken = generateRefreshToken(user.id)

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }
  }
}

module.exports = { registerUser, verifyOtp, loginUser }