import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getElections } from '../api/elections'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const [elections, setElections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { user } = useAuth()

  const fetchElections = () => {
    setLoading(true)
    setError(false)
    getElections().then(res => {
      setElections(res.data)
      setLoading(false)
    }).catch(() => {
      setError(true)
      setLoading(false)
    })
  }

  useEffect(() => { fetchElections() }, [])

  const statusConfig: Record<string, { label: string; color: string }> = {
    DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-600' },
    OPEN: { label: 'Open', color: 'bg-green-50 text-green-700 border border-green-200' },
    CLOSED: { label: 'Closed', color: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
    RESULTS_PUBLISHED: { label: 'Results Published', color: 'bg-blue-50 text-blue-700 border border-blue-200' }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        <div className="mb-8 pb-8 border-b border-gray-200">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Electoral Portal</p>
          <h1 className="text-3xl font-semibold text-black tracking-tight">Elections</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome, {user?.fullName} · {user?.role?.replace('_', ' ')}</p>
        </div>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-400">Loading elections...</p>
            <p className="text-xs text-gray-300 mt-1">Waking up server, please wait</p>
          </div>
        ) : error ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <p className="text-sm text-gray-500 mb-4">Could not connect to server. The backend may be starting up.</p>
            <button onClick={fetchElections}
              className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all duration-200 hover:bg-gray-800 hover:shadow-md hover:-translate-y-0.5">
              Try again
            </button>
          </div>
        ) : elections.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <p className="text-gray-400 text-sm">No elections are currently available.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {elections.map((election, i) => {
              const s = statusConfig[election.status]
              return (
                <Link key={election.id} to={`/elections/${election.id}`}
                  className="group bg-white border border-gray-200 rounded-xl px-6 py-5 flex items-center justify-between hover:border-gray-400 hover:shadow-sm transition-all duration-200 hover:-translate-y-0.5">
                  <div className="flex items-center gap-5">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h2 className="font-medium text-black text-sm">{election.title}</h2>
                      <p className="text-xs text-gray-400 mt-0.5">{election.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(election.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {' · '}
                        {election.positions?.length || 0} position{election.positions?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.color}`}>{s.label}</span>
                    <span className="text-gray-300 group-hover:text-gray-600 transition-colors text-sm">→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}