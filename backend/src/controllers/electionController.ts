import { Request, Response } from 'express'

const {
  createElection,
  getAllElections,
  getElectionById,
  addPosition,
  registerCandidate,
  updateElectionStatus,
  approveCandidate,
  removeElection
} = require('../services/electionService')

export async function httpCreateElection(req: Request, res: Response): Promise<void> {
  try {
    const { title, description, startTime, endTime } = req.body
    if (!title || !startTime || !endTime) {
      res.status(400).json({ message: 'Title, startTime and endTime are required' })
      return
    }
    const election = await createElection({
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      createdById: req.user!.userId
    })
    res.status(201).json(election)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export async function httpGetAllElections(req: Request, res: Response): Promise<void> {
  try {
    const status = req.query.status as string | undefined
    const elections = await getAllElections(status)
    res.status(200).json(elections)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export async function httpGetElectionById(req: Request, res: Response): Promise<void> {
  try {
    const election = await getElectionById(req.params.id as string)
    res.status(200).json(election)
  } catch (error: any) {
    res.status(404).json({ message: error.message })
  }
}

export async function httpAddPosition(req: Request, res: Response): Promise<void> {
  try {
    const { title, maxVotes } = req.body
    if (!title) {
      res.status(400).json({ message: 'Position title is required' })
      return
    }
    const position = await addPosition(req.params.id as string, title, maxVotes)
    res.status(201).json(position)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export async function httpRegisterCandidate(req: Request, res: Response): Promise<void> {
  try {
    const { manifesto } = req.body
    const candidate = await registerCandidate(req.params.positionId as string, req.user!.userId, manifesto)
    res.status(201).json(candidate)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export async function httpUpdateStatus(req: Request, res: Response): Promise<void> {
  try {
    const { status } = req.body
    if (!status) {
      res.status(400).json({ message: 'Status is required' })
      return
    }
    const election = await updateElectionStatus(req.params.id as string, status)
    res.status(200).json(election)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export async function httpApproveCandidate(req: Request, res: Response): Promise<void> {
  try {
    const candidate = await approveCandidate(req.params.candidateId as string)
    res.status(200).json(candidate)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export async function httpDeleteElection(req: Request, res: Response): Promise<void> {
  try {
    await removeElection(req.params.id as string)
    res.status(200).json({ message: 'Election deleted successfully' })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

module.exports = {
  httpCreateElection,
  httpGetAllElections,
  httpGetElectionById,
  httpAddPosition,
  httpRegisterCandidate,
  httpUpdateStatus,
  httpApproveCandidate,
  httpDeleteElection
}
