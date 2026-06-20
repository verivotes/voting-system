import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getElections } from '../api/elections'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const [elections, setElections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    getElections().then(res => {
      setElections(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const statusColor: Record<string, string> = {
    DRAFT: 'bg-gray-700 text-gray-300',
    OPEN: 'bg-green-900/50 text-green-400',
    CLOSED: 'bg-yellow-900/50 text-yellow-400',
    RESULTS_PUBLISHED: 'bg-blue-900/50 text-blue-400'
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Welcome, {user?.fullName}</h1>
          <p className="text-gray-400 text-sm mt-1">View and participate in active elections</p>
        </div>
        {loading ? (
          <div className="text-gray-500 text-sm">Loading elections...</div>
        ) : elections.length === 0 ? (
          <div className="text-gray-500 text-sm">No elections available.</div>
        ) : (
          <div className="grid gap-4">
            {elections.map(election => (
              <Link key={election.id} to={`/elections/${election.id}`}
                className="bg-gray-900 rounded-xl p-6 hover:bg-gray-800 transition border border-gray-800">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold text-lg">{election.title}</h2>
                    <p className="text-gray-400 text-sm mt-1">{election.description}</p>
                    <p className="text-gray-500 text-xs mt-3">
                      {new Date(election.startTime).toLocaleDateString()} — {new Date(election.endTime).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[election.status]}`}>
                    {election.status.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}