import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth'

const {
  httpCastVote,
  httpGetVotingStatus,
  httpGetResults,
  httpGetAuditLog,
  httpVerifyAuditChain
} = require('../controllers/voteController')

const router = Router()

router.post('/cast', authenticate, httpCastVote)
router.get('/status/:electionId', authenticate, httpGetVotingStatus)
router.get('/results/:electionId', authenticate, httpGetResults)
router.get('/audit-logs', authenticate, authorize('SUPER_ADMIN', 'ELECTION_ADMIN'), httpGetAuditLog)
router.get('/audit-logs/verify', authenticate, authorize('SUPER_ADMIN', 'ELECTION_ADMIN'), httpVerifyAuditChain)

module.exports = router