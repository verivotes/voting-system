import prisma from '../utils/prisma'
import { ElectionStatus } from '@prisma/client'

export async function createElection(data: {
  title: string
  description?: string
  startTime: Date
  endTime: Date
  createdById: string
}) {
  return prisma.election.create({ data })
}

export async function getAllElections(status?: ElectionStatus) {
  return prisma.election.findMany({
    where: status ? { status } : {},
    include: {
      createdBy: { select: { fullName: true, email: true } },
      positions: { include: { candidates: { include: { user: { select: { fullName: true } } } } } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getElectionById(id: string) {
  const election = await prisma.election.findUnique({
    where: { id },
    include: {
      createdBy: { select: { fullName: true, email: true } },
      positions: {
        include: {
          candidates: {
            where: { status: 'APPROVED' },
            include: { user: { select: { fullName: true, email: true } } }
          }
        }
      }
    }
  })
  if (!election) throw new Error('Election not found')
  return election
}

export async function addPosition(electionId: string, title: string, maxVotes: number = 1) {
  const election = await prisma.election.findUnique({ where: { id: electionId } })
  if (!election) throw new Error('Election not found')
  if (election.status !== 'DRAFT') throw new Error('Can only add positions to draft elections')

  return prisma.position.create({
    data: { electionId, title, maxVotes }
  })
}

export async function registerCandidate(positionId: string, userId: string, manifesto?: string) {
  const position = await prisma.position.findUnique({
    where: { id: positionId },
    include: { election: true }
  })
  if (!position) throw new Error('Position not found')
  if (position.election.status !== 'DRAFT') throw new Error('Candidate registration is closed')

  const existing = await prisma.candidate.findFirst({
    where: { positionId, userId }
  })
  if (existing) throw new Error('Already registered for this position')

  return prisma.candidate.create({
    data: { positionId, userId, manifesto }
  })
}

export async function updateElectionStatus(id: string, status: ElectionStatus) {
  const election = await prisma.election.findUnique({ where: { id } })
  if (!election) throw new Error('Election not found')

  return prisma.election.update({
    where: { id },
    data: { status, updatedAt: new Date() }
  })
}

export async function approveCandidate(candidateId: string) {
  return prisma.candidate.update({
    where: { id: candidateId },
    data: { status: 'APPROVED' }
  })
}
module.exports = {
  createElection,
  getAllElections,
  getElectionById,
  addPosition,
  registerCandidate,
  updateElectionStatus,
  approveCandidate
}
export async function removeElection(id: string) {
  const election = await prisma.election.findUnique({ where: { id } })
  if (!election) throw new Error('Election not found')
  if (election.status === 'OPEN') throw new Error('Cannot delete an open election')
  return prisma.election.delete({ where: { id } })
}