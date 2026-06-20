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

  if (loading) return <div className="min-h-screen bg-gray-950 text-gray-400 flex items-center justify-center">Loading results...</div>
  if (error) return <div className="min-h-screen bg-gray-950 text-red-400 flex items-center justify-center">{error}</div>

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <button onClick={() => navigate(`/elections/${id}`)} className="text-gray-400 text-sm mb-6 hover:text-white">← Back</button>
        <h1 className="text-2xl font-bold mb-2">Election Results</h1>
        <p className="text-gray-400 text-sm mb-8">{results?.election?.title}</p>
        <div className="space-y-6">
          {results?.positions?.map((pos: any) => {
            const totalVotes = pos.candidates.reduce((sum: number, c: any) => sum + c.votes, 0)
            return (
              <div key={pos.id} className="bg-gray-900 rounded-xl p-6">
                <h2 className="font-semibold mb-4">{pos.title}</h2>
                <div className="space-y-3">
                  {pos.candidates.map((c: any, i: number) => {
                    const pct = totalVotes > 0 ? Math.round((c.votes / totalVotes) * 100) : 0
                    return (
                      <div key={c.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={i === 0 ? 'text-yellow-400 font-medium' : 'text-gray-300'}>
                            {i === 0 && '🏆 '}{c.name}
                          </span>
                          <span className="text-gray-400">{c.votes} votes ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${i === 0 ? 'bg-yellow-500' : 'bg-blue-600'}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}