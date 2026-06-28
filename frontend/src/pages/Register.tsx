import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../api/auth'
import { Mail, Lock, User, UserPlus, AlertCircle } from 'lucide-react'

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
      await registerUser({ email, password, fullName })
      navigate('/login')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Server may be starting up — please try again.')
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

          <h1 className="text-2xl font-semibold text-black tracking-tight mb-1">Create account</h1>
          <p className="text-sm text-gray-500 mb-8">Join VeriVotes to participate in elections</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle size={14} className="flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-black pl-9 pr-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="John Doe" required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-black pl-9 pr-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="you@institution.edu" required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-black pl-9 pr-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="••••••••" required />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white py-2.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 hover:shadow-lg hover:-translate-y-0.5 mt-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <><UserPlus size={14} /> Create account</>
              )}
            </button>
            {loading && (
              <p className="text-center text-xs text-gray-400">
                Please wait — server may take up to 30 seconds to respond
              </p>
            )}
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-black font-medium hover:underline">Sign in</Link>
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