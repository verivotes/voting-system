import API from './auth'

export const getElections = (status?: string) =>
  API.get('/elections', { params: { status } })

export const getElection = (id: string) =>
  API.get(`/elections/${id}`)

export const createElection = (data: any) =>
  API.post('/elections', data)

export const updateElectionStatus = (id: string, status: string) =>
  API.put(`/elections/${id}/status`, { status })

export const addPosition = (electionId: string, data: any) =>
  API.post(`/elections/${electionId}/positions`, data)

export const approveCandidate = (candidateId: string) =>
  API.put(`/elections/candidates/${candidateId}/approve`, {})
export const deleteElection = (id: string) =>
  API.delete(`/elections/${id}`)
export const registerAsCandidate = (positionId: string, data: { manifesto: string }) =>
  API.post(`/elections/positions/${positionId}/candidates`, data)