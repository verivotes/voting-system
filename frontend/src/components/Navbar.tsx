import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
<Link to="/" className="flex items-center gap-2">
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="28" rx="6" fill="black"/>
    <rect x="7" y="8" width="14" height="13" rx="1.5" stroke="white" strokeWidth="1.5"/>
    <path d="M7 11h14" stroke="white" strokeWidth="1.5"/>
    <path d="M11 15.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  <span className="text-sm font-semibold text-black tracking-tight">VeriVotes</span>
</Link>
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className="text-sm text-gray-500 hover:text-black transition-colors">Elections</Link>
              {(user?.role === 'SUPER_ADMIN' || user?.role === 'ELECTION_ADMIN') && (
                <Link to="/admin" className="text-sm text-gray-500 hover:text-black transition-colors">Admin</Link>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-white text-xs font-medium">
                  {user?.fullName[0]}
                </div>
                <span className="text-sm text-gray-700 hidden md:block">{user?.fullName}</span>
              </div>
              <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-black transition-colors border border-gray-200 px-3 py-1.5 rounded-md hover:border-gray-400">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-500 hover:text-black transition-colors">Sign in</Link>
              <Link to="/register" className="text-sm bg-black text-white px-4 py-1.5 rounded-md hover:bg-gray-800 transition-colors">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}