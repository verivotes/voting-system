import prisma from '../utils/prisma'
import { createAuditHash } from '../utils/hash'

export async function castVote(userId: string, electionId: string, candidateId: string) {
  // Check election is open
  const election = await prisma.election.findUnique({ where: { id: electionId } })
  if (!election) throw new Error('Election not found')
  if (election.status !== 'OPEN') throw new Error('Election is not open for voting')

  // Check voter hasn't already voted
  const receipt = await prisma.voterReceipt.findUnique({
    where: { userId_electionId: { userId, electionId } }
  })
  if (receipt?.hasVoted) throw new Error('You have already voted in this election')

  // Check candidate exists and is approved
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: { position: true }
  })
  if (!candidate) throw new Error('Candidate not found')
  if (candidate.status !== 'APPROVED') throw new Error('Candidate is not approved')
  if (candidate.position.electionId !== electionId) throw new Error('Candidate does not belong to this election')

  // Get last audit log hash for chain
  const lastLog = await prisma.auditLog.findFirst({ orderBy: { timestamp: 'desc' } })
  const prevHash = lastLog?.entryHash || null

const timestamp = new Date().toISOString()
  const voteHash = createAuditHash(prevHash, {
    electionId,
    candidateId,
    timestamp
  })

  await prisma.$transaction([
    prisma.vote.create({ data: { candidateId, voteHash } }),
    prisma.voterReceipt.upsert({
      where: { userId_electionId: { userId, electionId } },
      update: { hasVoted: true, votedAt: new Date() },
      create: { userId, electionId, hasVoted: true, votedAt: new Date() }
    }),
    prisma.auditLog.create({
      data: {
        action: 'VOTE_CAST',
        entityType: 'Vote',
        actorId: userId,
        prevHash,
        entryHash: voteHash,
        metadata: { electionId, candidateId, timestamp }
      }
    })
  ])

  return { message: 'Vote cast successfully', voteHash }
}

export async function getVotingStatus(userId: string, electionId: string) {
  const receipt = await prisma.voterReceipt.findUnique({
    where: { userId_electionId: { userId, electionId } }
  })
  return { hasVoted: receipt?.hasVoted || false, votedAt: receipt?.votedAt || null }
}

export async function getResults(electionId: string) {
  const election = await prisma.election.findUnique({
    where: { id: electionId },
    include: {
      positions: {
        include: {
          candidates: {
            where: { status: 'APPROVED' },
            include: {
              user: { select: { fullName: true } },
              votes: true
            }
          }
        }
      }
    }
  })

  if (!election) throw new Error('Election not found')
  if (election.status !== 'RESULTS_PUBLISHED') throw new Error('Results are not published yet')

  return {
    election: { id: election.id, title: election.title, status: election.status },
    positions: election.positions.map(pos => ({
      id: pos.id,
      title: pos.title,
      candidates: pos.candidates
        .map(c => ({ id: c.id, name: c.user.fullName, votes: c.votes.length }))
        .sort((a, b) => b.votes - a.votes)
    }))
  }
}

export async function getAuditLog() {
  return prisma.auditLog.findMany({
    orderBy: { timestamp: 'asc' },
    include: { actor: { select: { fullName: true, email: true } } }
  })
}

export async function verifyAuditChain() {
  const logs = await prisma.auditLog.findMany({ orderBy: { timestamp: 'asc' } })
  let prevHash: string | null = null
  let intact = true

  for (const log of logs) {
    const meta = log.metadata as any
    const expectedHash = createAuditHash(prevHash, {
      electionId: meta?.electionId,
      candidateId: meta?.candidateId,
      timestamp: meta?.timestamp
    })
    if (expectedHash !== log.entryHash) {
      intact = false
      break
    }
    prevHash = log.entryHash
  }

  return { intact, totalEntries: logs.length }
}
module.exports = { castVote, getVotingStatus, getResults, getAuditLog, verifyAuditChain }