import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'

dotenv.config()

const voteRoutes = require('./routes/votes')
const electionRoutes = require('./routes/elections')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'VeriVotes API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/elections', electionRoutes)
app.use('/api/votes', voteRoutes)

// Keep-alive ping to prevent Railway from sleeping
setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('Keep-alive ping sent')
  } catch (e) {}
}, 4 * 60 * 1000) // every 4 minutes

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app