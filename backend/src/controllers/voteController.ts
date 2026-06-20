import { Request, Response } from 'express'
const { castVote, getVotingStatus, getResults, getAuditLog, verifyAuditChain } = require('../services/voteService')

export async function httpCastVote(req: Request, res: Response): Promise<void> {
  try {
    const { electionId, candidateId } = req.body
    if (!electionId || !candidateId) {
      res.status(400).json({ message: 'electionId and candidateId are required' })
      return
    }
    const result = await castVote(req.user!.userId, electionId, candidateId)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export async function httpGetVotingStatus(req: Request, res: Response): Promise<void> {
  try {
    const result = await getVotingStatus(req.user!.userId, req.params.electionId)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export async function httpGetResults(req: Request, res: Response): Promise<void> {
  try {
    const result = await getResults(req.params.electionId)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export async function httpGetAuditLog(req: Request, res: Response): Promise<void> {
  try {
    const logs = await getAuditLog()
    res.status(200).json(logs)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export async function httpVerifyAuditChain(req: Request, res: Response): Promise<void> {
  try {
    const result = await verifyAuditChain()
    res.status(200).json(result)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

module.exports = { httpCastVote, httpGetVotingStatus, httpGetResults, httpGetAuditLog, httpVerifyAuditChain }