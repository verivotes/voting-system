import { useEffect, useState } from 'react'
import { getElections, createElection, updateElectionStatus } from '../api/elections'
import { verifyAuditChain } from '../api/votes'

export default function AdminPanel() {
  const [elections, setElections] = useState<any[]>([])
  const [auditStatus, setAuditStatus] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [message, setMessage] = useState('')

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

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
        {auditStatus && (
          <div className={`px-4 py-3 rounded-xl text-sm mb-8 ${auditStatus.intact ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
            Audit chain: {auditStatus.intact ? '✓ Intact' : '✗ Tampered'} — {auditStatus.totalEntries} entries
          </div>
        )}
        {message && <div className="bg-blue-900/30 text-blue-300 text-sm px-4 py-3 rounded-xl mb-6">{message}</div>}
        <div className="bg-gray-900 rounded-2xl p-6 mb-8">
          <h2 className="font-semibold mb-4">Create Election</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Election title" required />
            <input value={description} onChange={e => setDescription(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Start time</label>
                <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">End time</label>
                <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
              Create Election
            </button>
          </form>
        </div>
        <div>
          <h2 className="font-semibold mb-4">Manage Elections</h2>
          <div className="space-y-3">
            {elections.map(el => (
              <div key={el.id} className="bg-gray-900 rounded-xl p-5 flex justify-between items-center">
                <div>
                  <p className="font-medium">{el.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{el.status}</p>
                </div>
                {nextStatus[el.status] && (
                  <button onClick={() => handleStatusChange(el.id, nextStatus[el.status])}
                    className="text-sm bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition">
                    {nextLabel[el.status]}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}