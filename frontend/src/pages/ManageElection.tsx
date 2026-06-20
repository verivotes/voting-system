import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getElection, addPosition, approveCandidate } from '../api/elections'

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">

        <button onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-black mb-8 transition-colors">
          ← Back to admin
        </button>

        <div className="mb-8 pb-6 border-b border-gray-200">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Manage Election</p>
          <h1 className="text-3xl font-semibold text-black tracking-tight">{election?.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              election?.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' :
              election?.status === 'OPEN' ? 'bg-green-50 text-green-700 border border-green-200' :
              'bg-yellow-50 text-yellow-700 border border-yellow-200'
            }`}>
              {election?.status?.replace('_', ' ')}
            </span>
            <span className="text-xs text-gray-400">{election?.positions?.length || 0} positions</span>
          </div>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            {message}
            <button onClick={() => setMessage('')} className="text-green-400 hover:text-green-700">✕</button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            {error}
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-700">✕</button>
          </div>
        )}

        {/* Add Position */}
        {isDraft && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
            <h2 className="text-sm font-semibold text-black mb-4">Add Position</h2>
            <form onSubmit={handleAddPosition} className="flex gap-3">
              <input
                value={positionTitle}
                onChange={e => setPositionTitle(e.target.value)}
                className="flex-1 bg-white border border-gray-300 text-black px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="e.g. President, Secretary General, Treasurer"
                required
              />
              <button type="submit" disabled={addingPosition}
                className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 whitespace-nowrap">
                {addingPosition ? 'Adding...' : '+ Add Position'}
              </button>
            </form>
          </div>
        )}

        {!isDraft && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-8 flex items-center gap-3">
            <span className="text-amber-500">⚠</span>
            <p className="text-amber-700 text-sm">Positions can only be added while the election is in Draft status.</p>
          </div>
        )}

        {/* Positions & Candidates */}
        <div>
          <h2 className="text-xs font-semibold text-black mb-4 uppercase tracking-widest">
            Positions & Candidates
          </h2>

          {election?.positions?.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <p className="text-sm text-gray-400">No positions added yet.</p>
              {isDraft && <p className="text-xs text-gray-400 mt-1">Add a position above to get started.</p>}
            </div>
          ) : (
            <div className="space-y-4">
              {election?.positions?.map((pos: any) => (
                <div key={pos.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-sm text-black">{pos.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {pos.candidates?.length || 0} candidate{pos.candidates?.length !== 1 ? 's' : ''} ·
                        {' '}{pos.candidates?.filter((c: any) => c.status === 'APPROVED').length} approved
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {pos.candidates?.length === 0 ? (
                      <p className="px-6 py-4 text-sm text-gray-400">No candidates registered for this position.</p>
                    ) : pos.candidates?.map((c: any) => (
                      <div key={c.id} className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                            c.status === 'APPROVED' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {c.user?.fullName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-black">{c.user?.fullName}</p>
                            <p className="text-xs text-gray-400">{c.user?.email}</p>
                            {c.manifesto && <p className="text-xs text-gray-400 mt-0.5 italic">"{c.manifesto}"</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {c.status === 'APPROVED' ? (
                            <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full font-medium">
                              Approved
                            </span>
                          ) : c.status === 'REJECTED' ? (
                            <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full font-medium">
                              Rejected
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full font-medium">
                                Pending
                              </span>
                              {isDraft && (
                                <button onClick={() => handleApprove(c.id)}
                                  className="text-xs bg-black text-white px-3 py-1 rounded-full font-medium hover:bg-gray-800 transition-colors">
                                  Approve
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