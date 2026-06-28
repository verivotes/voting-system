import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getElection, registerAsCandidate } from '../api/elections'
import { getVotingStatus } from '../api/votes'
import { useAuth } from '../hooks/useAuth'
import {
  ArrowLeft, ChevronRight, Users, Clock, Calendar,
  CheckCircle2, XCircle, BarChart3, FileText, Vote,
  UserPlus, ShieldCheck, Send, X
} from 'lucide-react'

export default function ElectionDetail() {
  const { id } = useParams()
  const [election, setElection] = useState<any>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [applyingTo, setApplyingTo] = useState<string | null>(null)
  const [manifesto, setManifesto] = useState('')
  const [applying, setApplying] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  const fetchElection = () => {
    if (!id) return
    Promise.all([getElection(id), getVotingStatus(id)])
      .then(([electionRes, statusRes]) => {
        setElection(electionRes.data)
        setHasVoted(statusRes.data.hasVoted)
        setLoading(false)
      }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchElection() }, [id])

  const handleApply = async (positionId: string) => {
    setApplying(true)
    setError('')
    try {
      await registerAsCandidate(positionId, { manifesto })
      setMessage('Application submitted. Awaiting admin approval.')
      setApplyingTo(null)
      setManifesto('')
      fetchElection()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application')
    } finally {
      setApplying(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
    </div>
  )

  if (!election) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-400">Election not found</div>
  )

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-600', icon: <FileText size={11} /> },
    OPEN: { label: 'Open for Voting', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: <CheckCircle2 size={11} /> },
    CLOSED: { label: 'Closed', color: 'bg-amber-50 text-amber-700 border border-amber-200', icon: <XCircle size={11} /> },
    RESULTS_PUBLISHED: { label: 'Results Published', color: 'bg-blue-50 text-blue-700 border border-blue-200', icon: <BarChart3 size={11} /> }
  }

  const s = statusConfig[election.status]
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ELECTION_ADMIN'
  const isAlreadyCandidate = (pos: any) =>
    pos.candidates?.some((c: any) => c.user?.email === user?.email || c.userId === user?.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Back */}
        <button onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors mb-6">
          <ArrowLeft size={14} /> Back to elections
        </button>

        {/* Alerts */}
        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg mb-5 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2"><CheckCircle2 size={14} /> {message}</span>
            <button onClick={() => setMessage('')}><X size={14} /></button>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2"><XCircle size={14} /> {error}</span>
            <button onClick={() => setError('')}><X size={14} /></button>
          </div>
        )}

        {/* Election header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-7 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
            <div className="flex-1">
              <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium mb-3 ${s.color}`}>
                {s.icon} {s.label}
              </span>
              <h1 className="text-xl sm:text-2xl font-semibold text-black tracking-tight leading-tight">{election.title}</h1>
              {election.description && <p className="text-sm text-gray-500 mt-1.5">{election.description}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar size={12} /> Opens {new Date(election.startTime).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock size={12} /> Closes {new Date(election.endTime).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Users size={12} /> {election.positions?.length || 0} positions
            </span>
          </div>
        </div>

        {/* CTA banners */}
        {election.status === 'OPEN' && !hasVoted && (
          <div className="bg-black rounded-xl p-5 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-white font-medium text-sm flex items-center gap-2">
                <Vote size={14} /> This election is open for voting
              </p>
              <p className="text-gray-400 text-xs mt-0.5">Your vote is anonymous and cannot be changed</p>
            </div>
            <button onClick={() => navigate(`/elections/${id}/ballot`)}
              className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap self-start sm:self-auto">
              Cast Vote <ChevronRight size={14} />
            </button>
          </div>
        )}

        {hasVoted && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5 flex items-center gap-3">
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-emerald-800 text-sm font-medium">Vote recorded</p>
              <p className="text-emerald-600 text-xs">You have participated in this election</p>
            </div>
          </div>
        )}

        {election.status === 'RESULTS_PUBLISHED' && (
          <button onClick={() => navigate(`/elections/${id}/results`)}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl text-sm font-medium mb-5 transition-all duration-200 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5">
            <BarChart3 size={14} /> View Official Results
          </button>
        )}

        {/* Positions */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Positions & Candidates</p>
          <div className="space-y-3">
            {election.positions?.map((pos: any) => {
              const approvedCandidates = pos.candidates?.filter((c: any) => c.status === 'APPROVED') || []
              return (
                <div key={pos.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-sm text-black">{pos.title}</h3>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Users size={10} /> {approvedCandidates.length} candidate{approvedCandidates.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {election.status === 'DRAFT' && !isAdmin && !isAlreadyCandidate(pos) && (
                        <button onClick={() => setApplyingTo(applyingTo === pos.id ? null : pos.id)}
                          title="Apply as Candidate"
                          className="inline-flex items-center gap-1.5 text-xs bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-all duration-200 hover:shadow-sm">
                          <UserPlus size={11} /> Apply
                        </button>
                      )}
                      {election.status === 'DRAFT' && !isAdmin && isAlreadyCandidate(pos) && (
                        <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg font-medium">
                          <Clock size={10} /> Pending Approval
                        </span>
                      )}
                      {isAdmin && election.status === 'DRAFT' && (
                        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg">
                          <ShieldCheck size={10} /> Admin
                        </span>
                      )}
                    </div>
                  </div>

                  {applyingTo === pos.id && !isAdmin && (
                    <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                      <p className="text-sm font-medium text-black mb-2">Your manifesto</p>
                      <textarea value={manifesto} onChange={e => setManifesto(e.target.value)}
                        className="w-full bg-white border border-gray-300 text-black px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                        placeholder="Tell voters why you should be elected..."
                        rows={3} />
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => handleApply(pos.id)} disabled={applying}
                          className="inline-flex items-center gap-1.5 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-800 disabled:opacity-50">
                          <Send size={12} /> {applying ? 'Submitting...' : 'Submit'}
                        </button>
                        <button onClick={() => { setApplyingTo(null); setManifesto('') }}
                          className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:border-gray-400 transition-colors">
                          <X size={12} /> Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="divide-y divide-gray-100">
                    {approvedCandidates.length === 0 ? (
                      <p className="px-5 py-4 text-sm text-gray-400 flex items-center gap-2">
                        <Users size={13} className="text-gray-300" /> No approved candidates yet
                      </p>
                    ) : approvedCandidates.map((c: any) => (
                      <div key={c.id} className="px-5 py-3.5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {c.user.fullName[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black">{c.user.fullName}</p>
                          {c.manifesto && <p className="text-xs text-gray-400 mt-0.5">{c.manifesto}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}