import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getElection, addPosition, approveCandidate } from '../api/elections'
import {
  ArrowLeft, Plus, CheckCircle2, XCircle, Clock,
  AlertTriangle, Users, ShieldCheck, X
} from 'lucide-react'

export default function ManageElection() {
  const { id } = useParams()
  const [election, setElection] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [positionTitle, setPositionTitle] = useState('')
  const [addingPosition, setAddingPosition] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const fetchElection = () => {
    if (!id) return
    getElection(id).then(res => {
      setElection(res.data)
      setLoading(false)
    })
  }

  useEffect(() => { fetchElection() }, [id])

  const handleAddPosition = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setAddingPosition(true)
    setError('')
    try {
      await addPosition(id, { title: positionTitle, maxVotes: 1 })
      setPositionTitle('')
      setMessage('Position added successfully')
      fetchElection()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add position')
    } finally {
      setAddingPosition(false)
    }
  }

  const handleApprove = async (candidateId: string) => {
    try {
      await approveCandidate(candidateId)
      setMessage('Candidate approved')
      fetchElection()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve candidate')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
    </div>
  )

  const isDraft = election?.status === 'DRAFT'

  const statusConfig: Record<string, { label: string; color: string }> = {
    DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-600' },
    OPEN: { label: 'Open', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    CLOSED: { label: 'Closed', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
    RESULTS_PUBLISHED: { label: 'Results Published', color: 'bg-blue-50 text-blue-700 border border-blue-200' }
  }

  const s = statusConfig[election?.status] || statusConfig.DRAFT
  const totalCandidates = election?.positions?.reduce((sum: number, p: any) => sum + (p.candidates?.length || 0), 0)
  const pendingCandidates = election?.positions?.reduce((sum: number, p: any) =>
    sum + (p.candidates?.filter((c: any) => c.status === 'PENDING').length || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <button onClick={() => navigate('/admin')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors mb-6">
          <ArrowLeft size={14} /> Back to admin
        </button>

        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Manage Election</p>
          <h1 className="text-2xl font-semibold text-black tracking-tight">{election?.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${s.color}`}>
              {s.label}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <ShieldCheck size={10} /> {election?.positions?.length || 0} positions
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Users size={10} /> {totalCandidates} candidates
            </span>
            {pendingCandidates > 0 && (
              <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
                <Clock size={10} /> {pendingCandidates} pending approval
              </span>
            )}
          </div>
        </div>

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

        {/* Add Position */}
        {isDraft ? (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-black mb-3 flex items-center gap-2">
              <Plus size={14} /> Add Position
            </h2>
            <form onSubmit={handleAddPosition} className="flex gap-3">
              <input value={positionTitle} onChange={e => setPositionTitle(e.target.value)}
                className="flex-1 bg-white border border-gray-300 text-black px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g. President, Secretary General, Treasurer"
                required />
              <button type="submit" disabled={addingPosition}
                className="inline-flex items-center gap-1.5 bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 whitespace-nowrap hover:shadow-md">
                <Plus size={13} /> {addingPosition ? 'Adding...' : 'Add Position'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
            <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
            <p className="text-amber-700 text-sm">Positions can only be added while the election is in Draft status.</p>
          </div>
        )}

        {/* Positions & Candidates */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Positions & Candidates</p>

          {election?.positions?.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <Users size={24} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No positions added yet.</p>
              {isDraft && <p className="text-xs text-gray-400 mt-1">Add a position above to get started.</p>}
            </div>
          ) : (
            <div className="space-y-3">
              {election?.positions?.map((pos: any) => (
                <div key={pos.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-sm text-black">{pos.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                        <span className="flex items-center gap-1"><Users size={10} /> {pos.candidates?.length || 0} total</span>
                        <span className="flex items-center gap-1"><CheckCircle2 size={10} /> {pos.candidates?.filter((c: any) => c.status === 'APPROVED').length} approved</span>
                        {pos.candidates?.filter((c: any) => c.status === 'PENDING').length > 0 && (
                          <span className="flex items-center gap-1 text-amber-600"><Clock size={10} /> {pos.candidates?.filter((c: any) => c.status === 'PENDING').length} pending</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {pos.candidates?.length === 0 ? (
                      <p className="px-5 py-4 text-sm text-gray-400 flex items-center gap-2">
                        <Users size={13} className="text-gray-300" /> No candidates registered for this position.
                      </p>
                    ) : pos.candidates?.map((c: any) => (
                      <div key={c.id} className="px-5 py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                            c.status === 'APPROVED' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {c.user?.fullName[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-black">{c.user?.fullName}</p>
                            <p className="text-xs text-gray-400">{c.user?.email}</p>
                            {c.manifesto && (
                              <p className="text-xs text-gray-400 mt-0.5 italic truncate">"{c.manifesto}"</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {c.status === 'APPROVED' ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
                              <CheckCircle2 size={10} /> Approved
                            </span>
                          ) : c.status === 'REJECTED' ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full font-medium">
                              <XCircle size={10} /> Rejected
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
                                <Clock size={10} /> Pending
                              </span>
                              {isDraft && (
                                <button onClick={() => handleApprove(c.id)}
                                  className="inline-flex items-center gap-1 text-xs bg-black text-white px-3 py-1.5 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 hover:shadow-sm">
                                  <CheckCircle2 size={10} /> Approve
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}