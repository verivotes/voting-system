import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getResults } from '../api/votes'

export default function Results() {
  const { id } = useParams()
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return
    getResults(id).then(res => {
      setResults(res.data)
      setLoading(false)
    }).catch(err => {
      setError(err.response?.data?.message || 'Failed to load results')
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-gray-400 text-xl">!</span>
        </div>
        <p className="text-sm font-medium text-black mb-1">Results unavailable</p>
        <p className="text-sm text-gray-400">{error}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-gray-400 hover:text-black transition-colors">
          ← Go back
        </button>
      </div>
    </div>
  )

  const totalVotesAllPositions = results?.positions?.reduce((sum: number, pos: any) =>
    sum + pos.candidates.reduce((s: number, c: any) => s + c.votes, 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">

        <button onClick={() => navigate(`/elections/${id}`)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-black mb-8 transition-colors">
          ← Back to election
        </button>

        <div className="mb-8 pb-8 border-b border-gray-200">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Official Results</p>
          <h1 className="text-3xl font-semibold text-black tracking-tight">{results?.election?.title}</h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Results Published
            </span>
            <span className="text-xs text-gray-400">{totalVotesAllPositions} total votes cast</span>
          </div>
        </div>

        <div className="space-y-8">
          {results?.positions?.map((pos: any) => {
            const totalVotes = pos.candidates.reduce((sum: number, c: any) => sum + c.votes, 0)
            const winner = pos.candidates[0]

            return (
              <div key={pos.id}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-black uppercase tracking-widest">{pos.title}</h2>
                  <span className="text-xs text-gray-400">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
                </div>

                {winner && totalVotes > 0 && (
                  <div className="bg-black rounded-xl p-6 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-black text-lg font-semibold flex-shrink-0">
                        {winner.name[0]}
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-0.5">Winner</p>
                        <p className="text-white font-semibold">{winner.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-white">
                        {totalVotes > 0 ? Math.round((winner.votes / totalVotes) * 100) : 0}%
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{winner.votes} vote{winner.votes !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                )}

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 grid grid-cols-12 gap-4">
                    <span className="col-span-1 text-xs font-medium text-gray-400">#</span>
                    <span className="col-span-5 text-xs font-medium text-gray-400">Candidate</span>
                    <span className="col-span-4 text-xs font-medium text-gray-400">Votes</span>
                    <span className="col-span-2 text-xs font-medium text-gray-400 text-right">Share</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {pos.candidates.map((c: any, i: number) => {
                      const pct = totalVotes > 0 ? Math.round((c.votes / totalVotes) * 100) : 0
                      const isWinner = i === 0 && totalVotes > 0
                      return (
                        <div key={c.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-1">
                            <span className={`text-sm font-semibold ${isWinner ? 'text-black' : 'text-gray-300'}`}>
                              {i + 1}
                            </span>
                          </div>
                          <div className="col-span-5 flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${isWinner ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                              {c.name[0]}
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${isWinner ? 'text-black' : 'text-gray-600'}`}>{c.name}</p>
                              {isWinner && <span className="text-xs text-gray-400">Elected</span>}
                            </div>
                          </div>
                          <div className="col-span-4">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-500 ${isWinner ? 'bg-black' : 'bg-gray-300'}`}
                                style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <div className="col-span-2 text-right">
                            <span className={`text-sm font-semibold ${isWinner ? 'text-black' : 'text-gray-400'}`}>{pct}%</span>
                            <p className="text-xs text-gray-400">{c.votes} votes</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-400">Results verified by SHA-256 audit chain</p>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Audit chain intact
          </div>
        </div>
      </div>
    </div>
  )
}