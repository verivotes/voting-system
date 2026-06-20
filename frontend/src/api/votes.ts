import API from './auth'

export const castVote = (data: { electionId: string; candidateId: string }) =>
  API.post('/votes/cast', data)

export const getVotingStatus = (electionId: string) =>
  API.get(`/votes/status/${electionId}`)

export const getResults = (electionId: string) =>
  API.get(`/votes/results/${electionId}`)

export const getAuditLogs = () =>
  API.get('/votes/audit-logs')

export const verifyAuditChain = () =>
  API.get('/votes/audit-logs/verify')