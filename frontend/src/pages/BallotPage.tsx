import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getElection } from '../api/elections'
import { castVote } from '../api/votes'
import {
  ArrowLeft, AlertTriangle, CheckCircle2, Vote,
  Send, ShieldCheck, Circle, CheckCircle
} from 'lucide-react'

export default function BallotPage() {
  const { id } = useParams()
  const [election, setElection] = useState<any>(null)
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [voteSubmitted, setVoteSubmitted] = useState(false)
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
      setVoteSubmitted(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cast vote')
      setSubmitting(false)
    }
  }

  const totalPositions = election?.positions?.length || 0
  const selectedCount = Object.keys(selections).length
  const allSelected = selectedCount === totalPositions && totalPositions > 0

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
    </div>
  )

  if (voteSubmitted) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-semibold text-black mb-2">Vote Cast</h1>
        <p className="text-sm text-gray-500 mb-8">Your ballot has been anonymously recorded and secured with SHA-256 encryption.</p>
        <button onClick={() => navigate(`/elections/${id}`)}
          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5">
          <ArrowLeft size={14} /> Back to election
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <button onClick={() => navigate(`/elections/${id}`)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors mb-6">
          <ArrowLeft size={14} /> Back to election
        </button>

        <div className="mb-6">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Vote size={11} /> Official Ballot
          </p>
          <h1 className="text-2xl font-semibold text-black tracking-tight">{election?.title}</h1>
          <p className="text-sm text-gray-500 mt-1">Select one candidate for each position</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 text-sm font-medium">Read before voting</p>
            <p className="text-amber-700 text-xs mt-0.5">Your vote is anonymous and cannot be changed after submission. Review your selections carefully.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertTriangle size={13} /> {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          {election?.positions?.map((pos: any, index: number) => (
            <div key={pos.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Position {index + 1} of {totalPositions}</p>
                  <h2 className="font-semibold text-black text-sm mt-0.5">{pos.title}</h2>
                </div>
                {selections[pos.id] ? (
                  <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
                    <CheckCircle2 size={10} /> Selected
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Choose one</span>
                )}
              </div>
              <div className="divide-y divide-gray-100">
                {pos.candidates?.filter((c: any) => c.status === 'APPROVED').map((c: any) => {
                  const isSelected = selections[pos.id] === c.id
                  return (
                    <button key={c.id} onClick={() => handleSelect(pos.id, c.id)}
                      className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all duration-150 ${isSelected ? 'bg-black' : 'hover:bg-gray-50'}`}>
                      <div className="flex-shrink-0">
                        {isSelected
                          ? <CheckCircle size={18} className="text-white" />
                          : <Circle size={18} className="text-gray-300" />
                        }
                      </div>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${isSelected ? 'bg-white text-black' : 'bg-gray-100 text-gray-600'}`}>
                        {c.user.fullName[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-black'}`}>
                          {c.user.fullName}
                        </p>
                        {c.manifesto && (
                          <p className={`text-xs mt-0.5 truncate ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                            {c.manifesto}
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })}
                {pos.candidates?.filter((c: any) => c.status === 'APPROVED').length === 0 && (
                  <p className="px-5 py-4 text-sm text-gray-400">No approved candidates for this position</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={`rounded-xl p-5 flex items-center justify-between gap-4 transition-colors ${allSelected ? 'bg-black' : 'bg-white border border-gray-200'}`}>
          <div>
            <p className={`text-sm font-medium ${allSelected ? 'text-white' : 'text-black'}`}>
              {selectedCount} of {totalPositions} positions selected
            </p>
            <p className={`text-xs mt-0.5 flex items-center gap-1 ${allSelected ? 'text-gray-300' : 'text-gray-400'}`}>
              {allSelected
                ? <><CheckCircle2 size={10} /> Ready to submit</>
                : <><Circle size={10} /> {totalPositions - selectedCount} remaining</>
              }
            </p>
          </div>
          <button onClick={handleSubmit} disabled={submitting || !allSelected}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
              allSelected
                ? 'bg-white text-black hover:bg-gray-100 hover:shadow-md'
                : 'bg-black text-white hover:bg-gray-800'
            }`}>
            {submitting
              ? <><div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> Submitting...</>
              : <><Send size={13} /> Submit Ballot</>
            }
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1.5">
          <ShieldCheck size={11} /> Votes are encrypted and anonymised via SHA-256 audit chain
        </p>

      </div>
    </div>
  )
}