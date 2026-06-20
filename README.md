# VeriVotes — Voting & Election Management System

> A transparent, auditable digital voting platform for institutional elections.  
> Final Year Project · Lead City University · Department of Software Engineering

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](https://opensource.org/licenses/MIT)
[![Stack: PERN](https://img.shields.io/badge/Stack-PERN-black.svg)]()
[![Status: Active](https://img.shields.io/badge/Status-Active-green.svg)]()

---

## Overview

VeriVotes is a full-stack web application that enables institutions to conduct secure, transparent, and auditable elections digitally. The system is designed to eliminate the inefficiencies and integrity issues associated with manual voting while preserving voter anonymity through a cryptographic audit trail.

The platform supports the full election lifecycle — from creating elections and registering candidates, to casting ballots and publishing results — all within a role-based access control system.

---

## Key Features

- **Secure Authentication** — JWT-based login with OTP email verification
- **Role-based Access Control** — Super Admin, Election Admin, and Voter roles
- **Anonymous Ballot Casting** — Votes are cryptographically decoupled from voter identity
- **Immutable Audit Log** — SHA-256 chained hash log; tampering is detectable
- **Live Election Management** — Create elections, add positions, approve candidates
- **Results Dashboard** — Vote tallies with percentage breakdown per position
- **Audit Chain Verification** — One-click integrity check of all election events

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS, Vite |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL (hosted on Supabase) |
| ORM | Prisma |
| Auth | JWT (access + refresh tokens), bcrypt |
| Audit | SHA-256 chained hash (Node.js crypto) |
| Hosting | Vercel (frontend), Railway (backend) |
| Version Control | Git + GitHub |

---

## System Architecture

voting-system/

├── backend/                  # Node.js + Express API

│   ├── src/

│   │   ├── routes/           # auth, elections, votes

│   │   ├── controllers/      # request handlers

│   │   ├── services/         # business logic

│   │   ├── middlewares/      # auth, role guards

│   │   └── utils/            # jwt, hash, prisma client

│   └── prisma/

│       └── schema.prisma     # database schema

└── frontend/                 # React + Vite

└── src/

├── pages/            # Login, Dashboard, Ballot, Results, Admin

├── components/       # Navbar, ProtectedRoute

├── api/              # axios API layer

├── context/          # AuthContext

└── hooks/            # useAuth

---

## Anonymity Design

The voting engine uses a two-table architecture to guarantee ballot anonymity:

- **`Vote` table** — stores which candidate received a vote and a SHA-256 hash. No voter identity is stored here.
- **`VoterReceipt` table** — stores which user has voted in which election. No candidate or ballot choice is stored here.

This means it is mathematically impossible to link a specific ballot to a specific voter, while still preventing double voting.

---

## Audit Chain

Every vote cast creates an entry in the `AuditLog` table. Each entry is hashed using SHA-256, incorporating the previous entry's hash — forming a tamper-evident chain. If any record is modified after the fact, the chain breaks and the `/api/votes/audit-logs/verify` endpoint will detect and report the compromise.

---

## Database Schema

| Table | Purpose |
|---|---|
| `User` | Voter and admin accounts |
| `Election` | Election records with lifecycle status |
| `Position` | Contestable positions within an election |
| `Candidate` | Registered candidates per position |
| `Vote` | Anonymous ballot records |
| `VoterReceipt` | Tracks who has voted (not how) |
| `AuditLog` | SHA-256 chained log of all events |
| `OtpToken` | Email verification tokens |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new voter |
| POST | `/api/auth/verify-otp` | Verify email OTP |
| POST | `/api/auth/login` | Login and receive JWT |

### Elections
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/elections` | List all elections |
| GET | `/api/elections/:id` | Get election details |
| POST | `/api/elections` | Create election (admin) |
| PUT | `/api/elections/:id/status` | Update election status |
| POST | `/api/elections/:id/positions` | Add position to election |
| PUT | `/api/elections/candidates/:id/approve` | Approve candidate |

### Voting
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/votes/cast` | Cast a ballot |
| GET | `/api/votes/status/:electionId` | Check voting status |
| GET | `/api/votes/results/:electionId` | Get published results |
| GET | `/api/votes/audit-logs` | View audit log (admin) |
| GET | `/api/votes/audit-logs/verify` | Verify audit chain integrity |

---

## Getting Started

### Prerequisites
- Node.js 20+
- Git
- A Supabase account (free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/verivotes/voting-system.git
cd voting-system

# Install backend dependencies
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Fill in your DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET

# Generate Prisma client
npx prisma generate

# Install frontend dependencies
cd ../frontend
npm install
```

### Running Locally

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Backend runs on `http://localhost:5000`  
Frontend runs on `http://localhost:5173`

---

## User Roles

| Role | Permissions |
|---|---|
| `VOTER` | Register, verify email, login, view elections, cast ballot, view results |
| `ELECTION_ADMIN` | All voter permissions + create elections, add positions, approve candidates, manage election lifecycle |
| `SUPER_ADMIN` | All permissions + access to audit logs and chain verification |

---

## Team

**Lead City University — Department of Software Engineering**  
Final Year Group Project · 2025/2026 Academic Session

| Name | Role |
|---|---|
| Asenguah Gaius | Group Leader & Lead Developer |
| Olugbadehan Adebayo | Team Member |
| Opajobi Oluwatishe | Team Member |
| Olujobi Temitola David | Team Member |
| Adesegun Martins Samad | Team Member |

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

Built with open-source tools: Node.js, React, PostgreSQL, Prisma, Tailwind CSS, and Vite.  
Hosted on free-tier infrastructure: Supabase, Railway, and Vercel.

---

*VeriVotes — Transparent Electoral Management for Modern Institutions*