import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getElection } from '../api/elections'
import { castVote } from '../api/votes'

export default function BallotPage() {
  const { id } = useParams()
  const [election, setElection] = useState<any>(null)
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return
    getElection(id).then(res => {
      setElection(res.data)
      setLoading(false)
    })
  }, [id])

  const handleSelect = (positionId: string, candidateId: string) => {
    setSelections(prev => ({ ...prev, [positionId]: candidateId }))
  }

  const handleSubmit = async () => {
    if (!id) return
    const positionIds = election.positions.map((p: any) => p.id)
    const unvoted = positionIds.filter((pid: string) => !selections[pid])
    if (unvoted.length > 0) {
      setError('Please select a candidate for every position')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      for (const [, candidateId] of Object.entries(selections)) {
        await castVote({ electionId: id, candidateId })
      }
      navigate(`/elections/${id}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cast vote')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-950 text-gray-400 flex items-center justify-center">Loading ballot...</div>

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">Ballot</h1>
        <p className="text-gray-400 text-sm mb-8">{election?.title} — Select one candidate per position</p>
        {error && <div className="bg-red-900/40 text-red-300 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>}
        <div className="space-y-6">
          {election?.positions?.map((pos: any) => (
            <div key={pos.id} className="bg-gray-900 rounded-xl p-6">
              <h2 className="font-semibold mb-4">{pos.title}</h2>
              <div className="space-y-3">
                {pos.candidates?.map((c: any) => (
                  <button key={c.id} onClick={() => handleSelect(pos.id, c.id)}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl border transition text-left ${
                      selections[pos.id] === c.id
                        ? 'border-blue-500 bg-blue-900/30'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                    }`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selections[pos.id] === c.id ? 'border-blue-500' : 'border-gray-500'
                    }`}>
                      {selections[pos.id] === c.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{c.user.fullName}</p>
                      {c.manifesto && <p className="text-xs text-gray-400 mt-0.5">{c.manifesto}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleSubmit} disabled={submitting}
          className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-medium transition disabled:opacity-50">
          {submitting ? 'Submitting ballot...' : 'Submit Ballot'}
        </button>
        <p className="text-center text-xs text-gray-600 mt-4">Your vote is anonymous and cannot be changed after submission</p>
      </div>
    </div>
  )
}