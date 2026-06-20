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
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold tracking-tight">VeriVotes</Link>
      <div className="flex items-center gap-6">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="text-sm text-gray-300 hover:text-white">Dashboard</Link>
            {(user?.role === 'SUPER_ADMIN' || user?.role === 'ELECTION_ADMIN') && (
              <Link to="/admin" className="text-sm text-gray-300 hover:text-white">Admin</Link>
            )}
            <span className="text-sm text-gray-400">{user?.fullName}</span>
            <button onClick={handleLogout} className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-gray-300 hover:text-white">Login</Link>
            <Link to="/register" className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}