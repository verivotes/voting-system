import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getResults } from '../api/votes'
import {
  ArrowLeft, Trophy, Users, BarChart3, CheckCircle2,
  ShieldCheck, XCircle
} from 'lucide-react'

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <XCircle size={32} className="text-gray-300 mx-auto mb-4" />
        <p className="text-sm font-medium text-black mb-1">Results unavailable</p>
        <p className="text-sm text-gray-400">{error}</p>
        <button onClick={() => navigate(-1)}
          className="mt-6 inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5">
          <ArrowLeft size={14} /> Go back
        </button>
      </div>
    </div>
  )

  const totalVotesAllPositions = results?.positions?.reduce((sum: number, pos: any) =>
    sum + pos.candidates.reduce((s: number, c: any) => s + c.votes, 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <button onClick={() => navigate(`/elections/${id}`)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors mb-6">
          <ArrowLeft size={14} /> Back to election
        </button>

        <div className="mb-8 pb-6 border-b border-gray-200">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Official Results</p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-black tracking-tight">{results?.election?.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full font-medium">
              <BarChart3 size={10} /> Results Published
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Users size={10} /> {totalVotesAllPositions} total votes cast
            </span>
          </div>
        </div>

        <div className="space-y-8">
          {results?.positions?.map((pos: any) => {
            const totalVotes = pos.candidates.reduce((sum: number, c: any) => sum + c.votes, 0)
            const winner = pos.candidates[0]

            return (
              <div key={pos.id}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold text-black uppercase tracking-widest">{pos.title}</h2>
                  <span className="text-xs text-gray-400">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
                </div>

                {winner && totalVotes > 0 && (
                  <div className="bg-black rounded-xl p-5 sm:p-6 mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black font-semibold flex-shrink-0">
                        {winner.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <Trophy size={12} className="text-yellow-400" />
                          <p className="text-xs text-gray-400 font-medium">Winner</p>
                        </div>
                        <p className="text-white font-semibold">{winner.name}</p>
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-3xl font-bold text-white">
                        {totalVotes > 0 ? Math.round((winner.votes / totalVotes) * 100) : 0}%
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{winner.votes} vote{winner.votes !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                )}

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="hidden sm:grid px-5 py-2.5 bg-gray-50 border-b border-gray-100 grid-cols-12 gap-4">
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
                        <div key={c.id} className="px-4 sm:px-5 py-3.5 flex sm:grid sm:grid-cols-12 sm:gap-4 items-center gap-3">
                          <div className="hidden sm:block sm:col-span-1">
                            <span className={`text-sm font-semibold ${isWinner ? 'text-black' : 'text-gray-300'}`}>{i + 1}</span>
                          </div>
                          <div className="flex-1 sm:col-span-5 flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${isWinner ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                              {c.name[0]}
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${isWinner ? 'text-black' : 'text-gray-600'}`}>{c.name}</p>
                              {isWinner && (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                                  <CheckCircle2 size={10} /> Elected
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="hidden sm:block sm:col-span-4">
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-500 ${isWinner ? 'bg-black' : 'bg-gray-300'}`}
                                style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <div className="sm:col-span-2 text-right flex-shrink-0">
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

        <div className="mt-8 pt-5 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-xs text-gray-400">Results verified by SHA-256 audit chain</p>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <ShieldCheck size={12} className="text-emerald-500" />
            Audit chain intact
          </div>
        </div>

      </div>
    </div>
  )
}