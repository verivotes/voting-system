import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getElections } from '../api/elections'
import { useAuth } from '../hooks/useAuth'
import {
  Vote, ChevronRight, RefreshCw, Calendar, Users,
  Clock, CheckCircle2, XCircle, BarChart3, FileText
} from 'lucide-react'

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

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    DRAFT: {
      label: 'Draft',
      color: 'bg-gray-100 text-gray-500',
      icon: <FileText size={11} />
    },
    OPEN: {
      label: 'Open',
      color: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      icon: <CheckCircle2 size={11} />
    },
    CLOSED: {
      label: 'Closed',
      color: 'bg-amber-50 text-amber-700 border border-amber-200',
      icon: <XCircle size={11} />
    },
    RESULTS_PUBLISHED: {
      label: 'Results Published',
      color: 'bg-blue-50 text-blue-700 border border-blue-200',
      icon: <BarChart3 size={11} />
    }
  }

  const openElections = elections.filter(e => e.status === 'OPEN')
  const otherElections = elections.filter(e => e.status !== 'OPEN')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Electoral Portal</p>
            <h1 className="text-2xl font-semibold text-black tracking-tight">Elections</h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome, {user?.fullName} ·{' '}
              <span className="text-gray-400">{user?.role?.replace('_', ' ')}</span>
            </p>
          </div>
          {!loading && !error && (
            <button onClick={fetchElections}
              title="Refresh"
              className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-black hover:border-gray-400 transition-all duration-200 hover:shadow-sm">
              <RefreshCw size={14} />
            </button>
          )}
        </div>

        {/* Stats row */}
        {!loading && !error && elections.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Total', value: elections.length, icon: <Vote size={14} /> },
              { label: 'Open', value: elections.filter(e => e.status === 'OPEN').length, icon: <CheckCircle2 size={14} /> },
              { label: 'Draft', value: elections.filter(e => e.status === 'DRAFT').length, icon: <FileText size={14} /> },
              { label: 'Closed', value: elections.filter(e => e.status === 'CLOSED' || e.status === 'RESULTS_PUBLISHED').length, icon: <BarChart3 size={14} /> },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3">
                <div className="text-gray-400">{stat.icon}</div>
                <div>
                  <p className="text-lg font-semibold text-black leading-none">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-400">Loading elections...</p>
            <p className="text-xs text-gray-300 mt-1">Server may be waking up, please wait</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <XCircle size={28} className="text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500 mb-4">Could not connect to server.</p>
            <button onClick={fetchElections}
              className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all duration-200 hover:bg-gray-800 hover:shadow-md hover:-translate-y-0.5">
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && elections.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Vote size={28} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">No elections are currently available.</p>
          </div>
        )}

        {/* Open elections */}
        {!loading && !error && openElections.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Active Now</p>
            <div className="space-y-2">
              {openElections.map(election => {
                const s = statusConfig[election.status]
                return (
                  <Link key={election.id} to={`/elections/${election.id}`}
                    className="group bg-black rounded-xl px-5 py-4 flex items-center justify-between hover:bg-gray-900 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Vote size={14} className="text-white" />
                      </div>
                      <div>
                        <h2 className="font-medium text-white text-sm">{election.title}</h2>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Users size={10} /> {election.positions?.length || 0} positions
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock size={10} /> Closes {new Date(election.endTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="hidden sm:inline-flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-medium">
                        <CheckCircle2 size={10} /> Open
                      </span>
                      <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Other elections */}
        {!loading && !error && otherElections.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              {openElections.length > 0 ? 'All Elections' : 'Elections'}
            </p>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {otherElections.map((election, i) => {
                const s = statusConfig[election.status]
                return (
                  <Link key={election.id} to={`/elections/${election.id}`}
                    className={`group flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors ${i !== 0 ? 'border-t border-gray-100' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500 flex-shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <h2 className="font-medium text-black text-sm">{election.title}</h2>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar size={10} /> {new Date(election.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Users size={10} /> {election.positions?.length || 0} positions
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`hidden sm:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${s.color}`}>
                        {s.icon} {s.label}
                      </span>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}