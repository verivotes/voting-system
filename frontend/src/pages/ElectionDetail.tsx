import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getElection } from '../api/elections'
import { getVotingStatus } from '../api/votes'

export default function ElectionDetail() {
  const { id } = useParams()
  const [election, setElection] = useState<any>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return
    Promise.all([getElection(id), getVotingStatus(id)])
      .then(([electionRes, statusRes]) => {
        setElection(electionRes.data)
        setHasVoted(statusRes.data.hasVoted)
        setLoading(false)
      }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen bg-gray-950 text-gray-400 flex items-center justify-center">Loading...</div>
  if (!election) return <div className="min-h-screen bg-gray-950 text-gray-400 flex items-center justify-center">Election not found</div>

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 text-sm mb-6 hover:text-white">← Back</button>
        <div className="bg-gray-900 rounded-2xl p-8 mb-6">
          <h1 className="text-2xl font-bold mb-2">{election.title}</h1>
          <p className="text-gray-400 text-sm mb-4">{election.description}</p>
          <div className="flex gap-4 text-xs text-gray-500">
            <span>Start: {new Date(election.startTime).toLocaleString()}</span>
            <span>End: {new Date(election.endTime).toLocaleString()}</span>
          </div>
        </div>
        {election.status === 'OPEN' && !hasVoted && (
          <button onClick={() => navigate(`/elections/${id}/ballot`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium mb-6 transition">
            Cast Your Vote
          </button>
        )}
        {hasVoted && (
          <div className="bg-green-900/30 border border-green-800 text-green-400 text-sm px-4 py-3 rounded-xl mb-6">
            ✓ You have already voted in this election
          </div>
        )}
        {election.status === 'RESULTS_PUBLISHED' && (
          <button onClick={() => navigate(`/elections/${id}/results`)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium mb-6 transition">
            View Results
          </button>
        )}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Positions</h2>
          {election.positions?.map((pos: any) => (
            <div key={pos.id} className="bg-gray-900 rounded-xl p-5">
              <h3 className="font-medium mb-3">{pos.title}</h3>
              <div className="space-y-2">
                {pos.candidates?.map((c: any) => (
                  <div key={c.id} className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                      {c.user.fullName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.user.fullName}</p>
                      {c.manifesto && <p className="text-xs text-gray-400">{c.manifesto}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}