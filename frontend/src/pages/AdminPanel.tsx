import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getElections, createElection, updateElectionStatus, deleteElection } from '../api/elections'
import { verifyAuditChain } from '../api/votes'

export default function AdminPanel() {
  const [elections, setElections] = useState<any[]>([])
  const [auditStatus, setAuditStatus] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'elections' | 'create' | 'audit'>('elections')

  useEffect(() => {
    getElections().then(res => setElections(res.data))
    verifyAuditChain().then(res => setAuditStatus(res.data))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createElection({ title, description, startTime, endTime })
      setMessage('Election created successfully')
      const res = await getElections()
      setElections(res.data)
      setTitle('')
      setDescription('')
      setStartTime('')
      setEndTime('')
      setActiveTab('elections')
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to create election')
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateElectionStatus(id, status)
      const res = await getElections()
      setElections(res.data)
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to update status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this election?')) return
    try {
      await deleteElection(id)
      const res = await getElections()
      setElections(res.data)
      setMessage('Election deleted successfully')
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to delete election')
    }
  }

  const nextStatus: Record<string, string> = {
    DRAFT: 'OPEN',
    OPEN: 'CLOSED',
    CLOSED: 'RESULTS_PUBLISHED'
  }

  const nextLabel: Record<string, string> = {
    DRAFT: 'Open Election',
    OPEN: 'Close Election',
    CLOSED: 'Publish Results'
  }

  const statusColor: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-600',
    OPEN: 'bg-green-50 text-green-700 border border-green-200',
    CLOSED: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    RESULTS_PUBLISHED: 'bg-blue-50 text-blue-700 border border-blue-200'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-8 pb-6 border-b border-gray-200">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Administration</p>
          <h1 className="text-3xl font-semibold text-black tracking-tight">Admin Panel</h1>
          {auditStatus && (
            <div className={`inline-flex items-center gap-2 mt-3 text-xs px-3 py-1.5 rounded-full font-medium ${auditStatus.intact ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${auditStatus.intact ? 'bg-green-500' : 'bg-red-500'}`} />
              Audit chain {auditStatus.intact ? 'intact' : 'compromised'} · {auditStatus.totalEntries} entries
            </div>
          )}
        </div>

        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            {message}
            <button onClick={() => setMessage('')} className="text-blue-400 hover:text-blue-700">✕</button>
          </div>
        )}

        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {(['elections', 'create', 'audit'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-md font-medium transition-colors capitalize ${activeTab === tab ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}>
              {tab === 'elections' ? 'Manage' : tab === 'create' ? 'New Election' : 'Audit Log'}
            </button>
          ))}
        </div>

        {activeTab === 'elections' && (
          <div className="space-y-3">
            {elections.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-sm text-gray-400">
                No elections yet. Create one to get started.
              </div>
            ) : elections.map(el => (
              <div key={el.id} className="bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="font-medium text-black text-sm">{el.title}</h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColor[el.status]}`}>
                      {el.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{el.positions?.length || 0} positions · Created {new Date(el.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link to={`/admin/elections/${el.id}`}
                    className="text-sm border border-gray-200 hover:border-black text-gray-600 hover:text-black px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-sm">
                    Manage
                  </Link>
                  {nextStatus[el.status] && (
                    <button onClick={() => handleStatusChange(el.id, nextStatus[el.status])}
                      className="text-sm border border-gray-200 hover:border-black text-gray-600 hover:text-black px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-sm">
                      {nextLabel[el.status]}
                    </button>
                  )}
                  {el.status !== 'OPEN' && (
                    <button onClick={() => handleDelete(el.id)}
                      className="text-sm border border-red-200 hover:border-red-500 text-red-500 hover:text-red-700 px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-sm">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
            <h2 className="font-semibold text-black mb-6">Create New Election</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Election title</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-black px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="e.g. Student Union Election 2025" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description</label>
                <input value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-black px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Brief description of the election" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Start date & time</label>
                  <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-black px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">End date & time</label>
                  <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-black px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" required />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5">
                  Create Election
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-black text-sm">Audit Chain Status</h2>
              <p className="text-xs text-gray-400 mt-0.5">Cryptographic verification of all election events</p>
            </div>
            <div className="p-6">
              {auditStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Chain integrity</span>
                    <span className={`text-sm font-medium ${auditStatus.intact ? 'text-green-600' : 'text-red-600'}`}>
                      {auditStatus.intact ? '✓ Intact' : '✗ Compromised'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Total log entries</span>
                    <span className="text-sm font-medium text-black">{auditStatus.totalEntries}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-gray-600">Algorithm</span>
                    <span className="text-sm font-medium text-black font-mono">SHA-256</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Loading audit status...</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}