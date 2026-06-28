import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getElections, createElection, updateElectionStatus, deleteElection } from '../api/elections'
import { verifyAuditChain } from '../api/votes'
import {
  ShieldCheck, Plus, Settings, ClipboardList, Trash2,
  ChevronRight, CheckCircle2, XCircle, BarChart3,
  FileText, Play, Square, Eye, Lock, Calendar
} from 'lucide-react'

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
      setTitle(''); setDescription(''); setStartTime(''); setEndTime('')
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
      setMessage('Election deleted')
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to delete election')
    }
  }

  const nextStatus: Record<string, string> = { DRAFT: 'OPEN', OPEN: 'CLOSED', CLOSED: 'RESULTS_PUBLISHED' }
  const nextLabel: Record<string, { label: string; icon: React.ReactNode }> = {
    DRAFT: { label: 'Open', icon: <Play size={11} /> },
    OPEN: { label: 'Close', icon: <Square size={11} /> },
    CLOSED: { label: 'Publish', icon: <Eye size={11} /> }
  }

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-600', icon: <FileText size={10} /> },
    OPEN: { label: 'Open', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: <CheckCircle2 size={10} /> },
    CLOSED: { label: 'Closed', color: 'bg-amber-50 text-amber-700 border border-amber-200', icon: <XCircle size={10} /> },
    RESULTS_PUBLISHED: { label: 'Published', color: 'bg-blue-50 text-blue-700 border border-blue-200', icon: <BarChart3 size={10} /> }
  }

  const tabs = [
    { id: 'elections', label: 'Manage', icon: <Settings size={13} /> },
    { id: 'create', label: 'New Election', icon: <Plus size={13} /> },
    { id: 'audit', label: 'Audit Log', icon: <ClipboardList size={13} /> },
  ] as const

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-8 pb-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Administration</p>
            <h1 className="text-2xl font-semibold text-black tracking-tight flex items-center gap-2">
              <ShieldCheck size={20} /> Admin Panel
            </h1>
          </div>
          {auditStatus && (
            <div className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-medium ${auditStatus.intact ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${auditStatus.intact ? 'bg-emerald-500' : 'bg-red-500'}`} />
              Audit chain {auditStatus.intact ? 'intact' : 'compromised'} · {auditStatus.totalEntries} entries
            </div>
          )}
        </div>

        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            {message}
            <button onClick={() => setMessage('')}><XCircle size={14} /></button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-md font-medium transition-colors ${activeTab === tab.id ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Manage tab */}
        {activeTab === 'elections' && (
          <div className="space-y-2">
            {elections.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-sm text-gray-400">
                No elections yet. Create one to get started.
              </div>
            ) : elections.map(el => {
              const s = statusConfig[el.status]
              const next = nextLabel[el.status]
              return (
                <div key={el.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-medium text-black text-sm">{el.title}</h3>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>
                          {s.icon} {s.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-3">
                        <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(el.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Settings size={10} /> {el.positions?.length || 0} positions</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/admin/elections/${el.id}`}
                      title="Manage"
                      className="inline-flex items-center gap-1.5 text-sm border border-gray-200 hover:border-black text-gray-600 hover:text-black px-3 py-1.5 rounded-lg transition-all duration-200 hover:shadow-sm">
                      <Settings size={12} /> Manage
                    </Link>
                    {nextStatus[el.status] && next && (
                      <button onClick={() => handleStatusChange(el.id, nextStatus[el.status])}
                        className="inline-flex items-center gap-1.5 text-sm border border-gray-200 hover:border-black text-gray-600 hover:text-black px-3 py-1.5 rounded-lg transition-all duration-200 hover:shadow-sm">
                        {next.icon} {next.label}
                      </button>
                    )}
                    {el.status !== 'OPEN' && (
                      <button onClick={() => handleDelete(el.id)}
                        title="Delete election"
                        className="inline-flex items-center gap-1.5 text-sm border border-red-200 hover:border-red-500 text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg transition-all duration-200 hover:shadow-sm">
                        <Trash2 size={12} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Create tab */}
        {activeTab === 'create' && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
            <h2 className="font-semibold text-black mb-6 flex items-center gap-2"><Plus size={16} /> Create New Election</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Election title</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-black px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g. Student Union Election 2026" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description</label>
                <input value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-black px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Brief description of the election" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1.5"><Calendar size={12} /> Start date & time</label>
                  <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-black px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1.5"><Clock size={12} /> End date & time</label>
                  <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-black px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black" required />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit"
                  className="inline-flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5">
                  <Plus size={14} /> Create Election
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Audit tab */}
        {activeTab === 'audit' && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <Lock size={14} className="text-gray-400" />
              <div>
                <h2 className="font-semibold text-black text-sm">Audit Chain</h2>
                <p className="text-xs text-gray-400">SHA-256 cryptographic verification</p>
              </div>
            </div>
            <div className="p-6">
              {auditStatus ? (
                <div className="space-y-0 divide-y divide-gray-100">
                  {[
                    { label: 'Chain integrity', value: auditStatus.intact ? '✓ Intact' : '✗ Compromised', color: auditStatus.intact ? 'text-emerald-600' : 'text-red-600' },
                    { label: 'Total log entries', value: auditStatus.totalEntries, color: 'text-black' },
                    { label: 'Hash algorithm', value: 'SHA-256', color: 'text-black font-mono' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between py-3">
                      <span className="text-sm text-gray-500">{row.label}</span>
                      <span className={`text-sm font-medium ${row.color}`}>{row.value}</span>
                    </div>
                  ))}
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