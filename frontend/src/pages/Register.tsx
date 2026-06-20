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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 shadow-xl">
        {step === 'register' ? (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Create account</h1>
            <p className="text-gray-400 text-sm mb-8">Join VeriVotes to participate in elections</p>
            {error && <div className="bg-red-900/40 text-red-300 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>}
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Full name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe" required />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com" required />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••" required />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-medium transition disabled:opacity-50">
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Sign in</Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Verify your email</h1>
            <p className="text-gray-400 text-sm mb-8">Enter the OTP sent to <span className="text-white">{email}</span>. Check your terminal for the OTP.</p>
            {error && <div className="bg-red-900/40 text-red-300 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>}
            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">OTP Code</label>
                <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest text-center text-lg"
                  placeholder="000000" maxLength={6} required />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-medium transition disabled:opacity-50">
                {loading ? 'Verifying...' : 'Verify email'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}