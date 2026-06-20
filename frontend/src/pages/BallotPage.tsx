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
      setError('Please select a candidate for every position before submitting')
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

  const totalPositions = election?.positions?.length || 0
  const selectedCount = Object.keys(selections).length

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-10">

        <div className="mb-8">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Official Ballot</p>
          <h1 className="text-2xl font-semibold text-black tracking-tight">{election?.title}</h1>
          <p className="text-sm text-gray-500 mt-1">Select one candidate for each position</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-8 flex items-start gap-3">
          <span className="text-amber-500 text-sm mt-0.5">⚠</span>
          <div>
            <p className="text-amber-800 text-sm font-medium">Read before voting</p>
            <p className="text-amber-700 text-xs mt-0.5">Your vote is anonymous, encrypted, and cannot be changed after submission. Review your selections carefully.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6 mb-8">
          {election?.positions?.map((pos: any, index: number) => (
            <div key={pos.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Position {index + 1}</p>
                  <h2 className="font-semibold text-black text-sm mt-0.5">{pos.title}</h2>
                </div>
                {selections[pos.id] && (
                  <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-medium">Selected</span>
                )}
              </div>
              <div className="divide-y divide-gray-100">
                {pos.candidates?.map((c: any) => (
                  <button key={c.id} onClick={() => handleSelect(pos.id, c.id)}
                    className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-colors ${
                      selections[pos.id] === c.id ? 'bg-black' : 'hover:bg-gray-50'
                    }`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selections[pos.id] === c.id ? 'border-white' : 'border-gray-300'
                    }`}>
                      {selections[pos.id] === c.id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                      selections[pos.id] === c.id ? 'bg-white text-black' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {c.user.fullName[0]}
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${selections[pos.id] === c.id ? 'text-white' : 'text-black'}`}>
                        {c.user.fullName}
                      </p>
                      {c.manifesto && (
                        <p className={`text-xs mt-0.5 ${selections[pos.id] === c.id ? 'text-gray-300' : 'text-gray-400'}`}>
                          {c.manifesto}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-black">{selectedCount} of {totalPositions} positions selected</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {selectedCount === totalPositions ? 'Ready to submit' : `${totalPositions - selectedCount} remaining`}
            </p>
          </div>
          <button onClick={handleSubmit} disabled={submitting || selectedCount !== totalPositions}
            className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {submitting ? 'Submitting...' : 'Submit Ballot'}
          </button>
        </div>

      </div>
    </div>
  )
}