import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await loginUser({ email, password })
      login(res.data.accessToken, res.data.refreshToken, res.data.user)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-10">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="6" fill="black"/>
              <rect x="7" y="8" width="14" height="13" rx="1.5" stroke="white" strokeWidth="1.5"/>
              <path d="M7 11h14" stroke="white" strokeWidth="1.5"/>
              <path d="M11 15.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-base font-semibold text-black tracking-tight">VeriVotes</span>
          </div>

          <h1 className="text-2xl font-semibold text-black tracking-tight mb-1">Sign in</h1>
          <p className="text-sm text-gray-500 mb-8">Access your VeriVotes account</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle size={14} className="flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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
              className="w-full inline-flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white py-2.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 hover:shadow-lg hover:-translate-y-0.5 mt-2">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><LogIn size={14} /> Sign in</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            No account?{' '}
            <Link to="/register" className="text-black font-medium hover:underline">Create one</Link>
          </p>

        </div>
      </div>

      <div className="border-t border-gray-100 py-4 px-6">
        <p className="text-center text-xs text-gray-400">
          VeriVotes · Lead City University · Transparent Electoral Management
        </p>
      </div>
    </div>
  )
}