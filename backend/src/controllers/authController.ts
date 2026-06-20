import { Request, Response } from 'express'
import { registerUser, verifyOtp, loginUser } from '../services/authService'

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName } = req.body
    if (!email || !password || !fullName) {
      res.status(400).json({ message: 'All fields are required' })
      return
    }
    const { user, otp } = await registerUser(email, password, fullName)
    console.log(`OTP for ${email}: ${otp}`)
    res.status(201).json({ message: 'Registration successful. Check your email for OTP.', userId: user.id })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export const verify = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, token } = req.body
    if (!email || !token) {
      res.status(400).json({ message: 'Email and token are required' })
      return
    }
    const result = await verifyOtp(email, token)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' })
      return
    }
    const result = await loginUser(email, password)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}