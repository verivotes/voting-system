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

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
    </div>
  )

  if (!election) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-400">Election not found</div>
  )

  const statusConfig: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-600',
    OPEN: 'bg-green-50 text-green-700 border border-green-200',
    CLOSED: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    RESULTS_PUBLISHED: 'bg-blue-50 text-blue-700 border border-blue-200'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <button onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-black text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 mb-8">
          ← Back to elections
        </button>

        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Election</p>
              <h1 className="text-xl sm:text-2xl font-semibold text-black tracking-tight">{election.title}</h1>
              <p className="text-sm text-gray-500 mt-1">{election.description}</p>
            </div>
            <span className={`self-start text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${statusConfig[election.status]}`}>
              {election.status.replace('_', ' ')}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-xs text-gray-400 pt-4 border-t border-gray-100">
            <span>Opens: {new Date(election.startTime).toLocaleString('en-GB')}</span>
            <span>Closes: {new Date(election.endTime).toLocaleString('en-GB')}</span>
          </div>
        </div>

        {election.status === 'OPEN' && !hasVoted && (
          <div className="bg-black rounded-xl p-5 sm:p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-white font-medium text-sm">This election is open for voting</p>
              <p className="text-gray-400 text-xs mt-0.5">Your vote is anonymous and cannot be changed</p>
            </div>
            <button onClick={() => navigate(`/elections/${id}/ballot`)}
              className="bg-white text-black px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap self-start sm:self-auto">
              Cast Vote →
            </button>
          </div>
        )}

        {hasVoted && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs">✓</span>
            </div>
            <div>
              <p className="text-green-800 text-sm font-medium">Vote recorded</p>
              <p className="text-green-600 text-xs">You have participated in this election</p>
            </div>
          </div>
        )}

        {election.status === 'RESULTS_PUBLISHED' && (
          <button onClick={() => navigate(`/elections/${id}/results`)}
            className="w-full bg-black text-white py-3 rounded-xl text-sm font-medium mb-6 transition-all duration-200 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 ring-2 ring-offset-2 ring-transparent hover:ring-gray-400">
            View Official Results →
          </button>
        )}

        <div>
          <h2 className="text-xs font-semibold text-black mb-4 uppercase tracking-widest">Positions & Candidates</h2>
          <div className="space-y-4">
            {election.positions?.map((pos: any) => (
              <div key={pos.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="font-medium text-sm text-black">{pos.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{pos.candidates?.length || 0} candidate{pos.candidates?.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {pos.candidates?.length === 0 ? (
                    <p className="px-4 sm:px-6 py-4 text-sm text-gray-400">No approved candidates yet</p>
                  ) : pos.candidates?.map((c: any) => (
                    <div key={c.id} className="px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4">
                      <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {c.user.fullName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-black">{c.user.fullName}</p>
                        {c.manifesto && <p className="text-xs text-gray-400 mt-0.5">{c.manifesto}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}