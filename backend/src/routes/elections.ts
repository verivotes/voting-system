import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth'

const {
  httpCreateElection,
  httpGetAllElections,
  httpGetElectionById,
  httpAddPosition,
  httpRegisterCandidate,
  httpUpdateStatus,
  httpApproveCandidate,
  httpDeleteElection
} = require('../controllers/electionController')

console.log('httpGetAllElections:', typeof httpGetAllElections)

const router = Router()

router.get('/', authenticate, httpGetAllElections)
router.get('/:id', authenticate, httpGetElectionById)
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ELECTION_ADMIN'), httpCreateElection)
router.put('/:id/status', authenticate, authorize('SUPER_ADMIN', 'ELECTION_ADMIN'), httpUpdateStatus)
router.post('/:id/positions', authenticate, authorize('SUPER_ADMIN', 'ELECTION_ADMIN'), httpAddPosition)
router.post('/positions/:positionId/candidates', authenticate, httpRegisterCandidate)
router.put('/candidates/:candidateId/approve', authenticate, authorize('SUPER_ADMIN', 'ELECTION_ADMIN'), httpApproveCandidate)
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ELECTION_ADMIN'), httpDeleteElection)

module.exports = router