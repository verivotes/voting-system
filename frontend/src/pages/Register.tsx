import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser, verifyOtp } from '../api/auth'

export default function Register() {
  const [step, setStep] = useState<'register' | 'verify'>('register')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await registerUser({ email, password, fullName })
      setStep('verify')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await verifyOtp({ email, token: otp })
      navigate('/login')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center mb-6">
              <span className="text-white text-sm font-bold">V</span>
            </div>
            {step === 'register' ? (
              <>
                <h1 className="text-2xl font-semibold text-black tracking-tight">Create account</h1>
                <p className="text-sm text-gray-500 mt-1">Join VeriVotes to participate in elections</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-semibold text-black tracking-tight">Verify your email</h1>
                <p className="text-sm text-gray-500 mt-1">Enter the OTP sent to <span className="text-black font-medium">{email}</span></p>
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {step === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-black px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="John Doe" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-black px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="you@institution.edu" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-black px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="••••••••" required />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-black hover:bg-gray-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 mt-2">
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700 mb-2">
                Check your backend terminal for the OTP code
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">OTP Code</label>
                <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-black px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent tracking-widest text-center text-lg font-mono"
                  placeholder="000000" maxLength={6} required />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-black hover:bg-gray-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {loading ? 'Verifying...' : 'Verify & continue'}
              </button>
              <button type="button" onClick={() => setStep('register')}
                className="w-full text-sm text-gray-400 hover:text-black transition-colors py-2">
                ← Back
              </button>
            </form>
          )}

          {step === 'register' && (
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account? <Link to="/login" className="text-black font-medium hover:underline">Sign in</Link>
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 py-4 px-6">
        <p className="text-center text-xs text-gray-400">VeriVotes · Transparent Electoral Management System</p>
      </div>
    </div>
  )
}