import prisma from '../utils/prisma'
import { hashPassword, comparePassword, generateOtp } from '../utils/hash'
import { generateAccessToken, generateRefreshToken } from '../utils/jwt'
const { sendOtpEmail } = require('./emailService')
import { OtpPurpose } from '@prisma/client'

export async function registerUser(email: string, password: string, fullName: string) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error('Email already registered')

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { email, passwordHash, fullName }
  })

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

  try {
    await sendOtpEmail(email, otp, fullName)
    console.log(`OTP email sent to ${email}`)
  } catch (err: any) {
    console.error('Failed to send OTP email — full error:', err.message)
    console.error('Error code:', err.code)
    console.error('Error response:', err.response)
    console.log(`Fallback OTP for ${email}: ${otp}`)
  }

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
  if (!user.isVerified) throw new Error('Email not verified')

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