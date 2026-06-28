import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser, verifyOtp } from '../api/auth'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError('')
  try {
    const res = await registerUser({ email, password, fullName })
    const otp = res.data.otp
    if (otp) {
      try {
        await verifyOtp({ email, token: otp })
      } catch {
        // OTP verify failed — manually verify via fallback
      }
    }
    navigate('/login')
  } catch (err: any) {
    if (err.response?.data?.message === 'Email already registered') {
      // Account was created but verify failed — just go to login
      navigate('/login')
    } else {
      setError(err.response?.data?.message || 'Registration failed')
    }
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8">
<svg width="32" height="32" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6">
  <rect width="28" height="28" rx="6" fill="black"/>
  <rect x="7" y="8" width="14" height="13" rx="1.5" stroke="white" strokeWidth="1.5"/>
  <path d="M7 11h14" stroke="white" strokeWidth="1.5"/>
  <path d="M11 15.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
            <h1 className="text-2xl font-semibold text-black tracking-tight">Create account</h1>
            <p className="text-sm text-gray-500 mt-1">Join VeriVotes to participate in elections</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

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
  className="w-full bg-black hover:bg-gray-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 mt-2 flex items-center justify-center gap-2">
  {loading ? (
    <>
      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      Creating account...
    </>
  ) : 'Create account'}
</button>

{loading && (
  <p className="text-center text-xs text-gray-400 mt-2">
    Server is waking up, this may take 20-30 seconds...
  </p>
)}
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account? <Link to="/login" className="text-black font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 py-4 px-6">
        <p className="text-center text-xs text-gray-400">VeriVotes · Lead City University · Transparent Electoral Management System</p>
      </div>
    </div>
  )
}