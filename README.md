# CampusCollab - Student Collaboration, Hackathon Discovery & Project Execution Platform

CampusCollab is a full-stack MERN application engineered for university ecosystems. It bridges the gap between hackathon discovery, complementary skill-based team formation, and deterministic engineering roadmap execution through its built-in Project PathFinder Engine.

Designed with a high-contrast, minimalist design system free of icon clutter, CampusCollab emphasizes technical clarity, responsive accessibility, and end-to-end project coordination.

---

## Table of Contents

- [Core Value Proposition](#core-value-proposition)
- [Key Features](#key-features)
  - [1. Project PathFinder Engine](#1-project-pathfinder-engine)
  - [2. Campus Verified Hackathons & Live Squad Inspector](#2-campus-verified-hackathons--live-squad-inspector)
  - [3. Project Workspace & Unique Project Cards](#3-project-workspace--unique-project-cards)
  - [4. Team Assembly & Skill Gap Analysis](#4-team-assembly--skill-gap-analysis)
  - [5. Teammate Discovery & Profiles](#5-teammate-discovery--profiles)
  - [6. Administrator Portal & Access Control](#6-administrator-portal--access-control)
- [Technology Stack](#technology-stack)
- [Project Architecture & Directory Structure](#project-architecture--directory-structure)
- [REST API Reference](#rest-api-reference)
- [Installation & Getting Started](#installation--getting-started)
- [Default Administrator Credentials](#default-administrator-credentials)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Design Guidelines & Zero-Icon Standard](#design-guidelines--zero-icon-standard)

---

## Core Value Proposition

Student hackathons and academic software projects frequently encounter three points of failure:
1. Asymmetric discovery: Students miss campus-specific hackathons and verified university competitions.
2. Unbalanced squad assembly: Teams form based on social proximity rather than complementary technical skill sets (e.g., four frontend developers and no backend or database engineer).
3. Execution paralysis: Once formed, novice teams lack architectural direction, struggle to decompose requirements into milestones, and fail to track dependencies.

CampusCollab addresses every stage of this lifecycle: discovering verified events, computing team skill gaps, formulating deterministic project roadmaps on a visual winding highway canvas, and providing Kanban workspaces for task tracking.

---

## Key Features

### 1. Project PathFinder Engine
The PathFinder Engine is an intelligent planning system that converts high-level project ideas into deterministic, dependency-aware engineering schedules.

- 4-Step Interactive Wizard:
  - Step 1: Project brief, problem statement, domain selection, and target timeline.
  - Step 2: Architecture & technical stack formulation.
  - Step 3: Team capacity and skill profile mapping (member proficiencies, weekly bandwidth).
  - Step 4: Plan generation and interactive roadmap exploration.
- Dual Planning Methodologies:
  - Guide Me From Scratch: Automatically decomposes the problem statement, recommends optimal architecture tiers (frontend, backend, database, infrastructure), and structures modules based on domain best practices.
  - I Know My Stack: Preserves user-defined technical stacks, generating module boundaries and integration tests tailored specifically to chosen technologies.
- Deterministic DAG & Topological Scheduling:
  - Uses Directed Acyclic Graph (DAG) topological sorting to sequence tasks based on prerequisite completion times.
  - Identifies parallel execution tracks and the critical path.
- Heuristic Skill & Workload Allocation:
  - Analyzes each task's domain requirements and matches them against team members' declared proficiencies and available weekly hours.
  - Balances workload to avoid single-developer bottlenecks and burnout.
- 4-Phase Visual Highway Roadmap:
  - Renders project milestones (Foundation, Core Logic, Integration, Deployment) along a winding serpentine highway canvas.
  - Bidirectional Waypoint Hover Inspector: Hovering over any waypoint highlights assigned module details, assignee metadata, and deliverables.
  - Direct Task Navigation: Clicking a waypoint navigates directly to the corresponding task in the execution board.
- Dynamic Replanning Engine:
  - When blockers arise, deadlines shift, or teammates change, the engine dynamically recalculates remaining tasks while preserving all completed work.
- Live Architecture Editor:
  - Allows editing frontend, backend, database, and devops layers directly with real-time plan re-generation.
- 1-Click Export to Workspace:
  - Translates PathFinder tasks and milestones directly into Kanban cards within the shared Project Workspace.

### 2. Campus Verified Hackathons & Live Squad Inspector
- Verified Campus Feed:
  - Displays campus-verified hackathons filtered for university competitions, showcasing dates, locations, eligibility criteria, prize pools, and direct registration links.
- Live Registered Squad Hover Inspector:
  - Hovering over registered squad badges reveals squad names, team leads, and full teammate rosters with individual technical proficiencies.
- Admin Event Publishing:
  - Direct on-page "+ Add Hackathon" modal for administrators to publish, configure, and manage university hackathons.

### 3. Project Workspace & Unique Project Cards
- Deduplicated Project Dashboard:
  - Guarantees exactly one card per unique project on both frontend and backend layers, eliminating redundant cards.
- In-Place Modal Editing:
  - Edit project titles, descriptions, repository URLs, and tags directly without leaving the workspace.
- Multi-Column Kanban Workflow:
  - Manage tasks across Todo, In Progress, and Completed states with assignee tags, priority badges, and progress indicators.

### 4. Team Assembly & Skill Gap Analysis
- Squad Creation & Recruitment:
  - Create squads, set capacity limits, link target hackathons, and recruit peers.
- Automated Skill Gap Analysis:
  - Evaluates the team's combined technical stack against required project proficiencies, visually flagging missing competencies (e.g., cloud deployment, machine learning, database tuning).
- Team Invitations & Join Requests:
  - Send direct invitations to peers and review incoming join requests with leader approval controls.

### 5. Teammate Discovery & Profiles
- Search & Skill Filter:
  - Search university students by technical competencies, graduation year, and department.
- Comprehensive Profiles:
  - Display bio, contact details, declared technical skills, project portfolio, and GitHub profile integration.

### 6. Administrator Portal & Access Control
- Role-Based Access Control (RBAC):
  - Differentiates between Student and Admin privileges using JSON Web Tokens (JWT) and authorization middleware (`adminOnly`).
- Dedicated Admin Access:
  - Dedicated admin login route (`/admin-login`) and event administration interface (`/admin/hackathons`).

---

## Technology Stack

| Layer | Technologies & Libraries | Key Responsibilities |
|---|---|---|
| Frontend Framework | React 18, Vite | Single-page application, fast HMR build pipeline |
| Frontend Routing | React Router v6 | Client-side routing with role-protected route guards |
| UI & Styling | Bootstrap 5, Custom CSS Tokens | Clean, high-contrast, responsive layout; zero-icon UI |
| HTTP Client | Axios | REST API communication with JWT bearer interceptors |
| Backend Runtime | Node.js, Express.js | REST API server, authentication middleware, error handling |
| Database & ODM | MongoDB 6+, Mongoose 8+ | Document store, schemas, relational `.populate()` references |
| Authentication | JSON Web Tokens (JWT), bcryptjs | Stateless authorization, password salt hashing |
| Algorithmic Engine | Pathfinder Engine (Custom JS) | Topological sorting, DAG scheduling, heuristic workload allocation |
| External APIs | GitHub REST API | Repository linking, student portfolio data |

---

## Project Architecture & Directory Structure

```text
CampusCollab/
├── backend/
│   ├── middleware/
│   │   └── auth.js                 # JWT verification and admin role check middleware
│   ├── models/
│   │   ├── Hackathon.js            # Hackathon schema (dates, location, prizes, registered teams)
│   │   ├── Invitation.js           # Team invitation schema
│   │   ├── JoinRequest.js          # Squad join request schema
│   │   ├── PathfinderPlan.js       # Generated project plans, DAG tasks, and milestones
│   │   ├── Project.js              # Project schema, tasks, and member assignments
│   │   ├── Skill.js                # Standardized skill taxonomy schema
│   │   ├── Team.js                 # Squad schema, members, and hackathon linkage
│   │   └── User.js                 # User schema (roles, skills, bio, credentials)
│   ├── routes/
│   │   ├── auth.js                 # Authentication routes (login, register, me, admin-login)
│   │   ├── dashboard.js            # Aggregated analytics and summary metrics
│   │   ├── github.js               # GitHub API proxy and repository verification
│   │   ├── hackathons.js           # Hackathon CRUD and team registration
│   │   ├── invitations.js          # Team invitation management
│   │   ├── pathfinder.js           # PathFinder generation, plan CRUD, replanning, and export
│   │   ├── profile.js              # User profile update endpoints
│   │   ├── project.js              # Single project operations
│   │   ├── projects.js             # Project listing, deduplication, and workspace endpoints
│   │   ├── skills.js               # Skill taxonomy retrieval
│   │   ├── student.js              # Student directory and public profile endpoints
│   │   ├── teammates.js            # Teammate search and filtering
│   │   └── teams.js                # Squad creation, management, and skill gap calculation
│   ├── services/
│   │   ├── aiPlannerService.js     # Architectural planning heuristics
│   │   └── pathfinderEngine.js     # Topological scheduler, DAG validator, workload allocator
│   ├── test/
│   │   └── pathfinder.test.js      # Unit tests for DAG scheduler and replanning engine
│   ├── db.js                       # MongoDB connection & admin user seeding
│   ├── package.json                # Backend dependencies and scripts
│   └── server.js                   # Express application entry point
├── frontend/
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── assets/                 # Brand assets
│   │   ├── components/             # Reusable UI components
│   │   │   ├── EmptyState.jsx      # Fallback state component
│   │   │   ├── Footer.jsx          # Site footer
│   │   │   ├── HackathonCard.jsx   # Card with registered squad hover inspector
│   │   │   ├── LoadingState.jsx    # Loading spinner and indicator
│   │   │   ├── Modal.jsx           # Reusable modal dialog
│   │   │   ├── Navbar.jsx          # Navigation header with role-aware menu
│   │   │   ├── ProjectCard.jsx     # Deduplicated project card with in-place editor
│   │   │   ├── ProtectedRoute.jsx  # Client-side route protection
│   │   │   ├── SkillBadge.jsx      # High-contrast skill chip component
│   │   │   ├── SkillGapCard.jsx    # Visual missing skill analyzer
│   │   │   └── TeammateCard.jsx    # Student profile summary card
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global authentication state provider
│   │   ├── pages/                  # Top-level view components
│   │   │   ├── AdminHackathons.jsx # Administrator hackathon management
│   │   │   ├── AdminLogin.jsx      # Administrator login portal
│   │   │   ├── Dashboard.jsx       # Student dashboard with analytics
│   │   │   ├── Hackathon.jsx       # Campus verified hackathons feed
│   │   │   ├── HackathonDetails.jsx# Detailed hackathon view with registered squads
│   │   │   ├── Home.jsx            # Landing page
│   │   │   ├── Invitations.jsx     # Pending invites and join requests
│   │   │   ├── Login.jsx           # Student login
│   │   │   ├── PathfinderCreate.jsx # 4-step PathFinder planning wizard
│   │   │   ├── PathfinderDetails.jsx# Serpentine highway roadmap & task board
│   │   │   ├── PathfinderLanding.jsx# PathFinder intro and plans directory
│   │   │   ├── Profile.jsx         # User profile editor
│   │   │   ├── Project.jsx         # Workspace project directory
│   │   │   ├── ProjectDetails.jsx  # Multi-column Kanban workspace
│   │   │   ├── Register.jsx        # Account registration
│   │   │   ├── Student.jsx         # Student discovery directory
│   │   │   ├── StudentProfile.jsx  # Public student profile view
│   │   │   ├── TeamDetails.jsx     # Squad workspace and skill gap card
│   │   │   ├── Teammates.jsx       # Teammate finder with skill filters
│   │   │   └── Teams.jsx           # Squad list and creation
│   │   ├── services/
│   │   │   └── api.js              # Axios instance with auth headers
│   │   ├── App.jsx                 # Route definitions and layout wrapper
│   │   ├── index.css               # Unified monochrome design system
│   │   └── main.jsx                # React DOM root entry point
│   ├── index.html                  # HTML entry point
│   ├── package.json                # Frontend dependencies and scripts
│   └── vite.config.js              # Vite configuration
└── README.md
```

---

## REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create student account (returns JWT).
- `POST /api/auth/login` - Authenticate student (returns JWT).
- `POST /api/auth/admin-login` - Authenticate administrator (returns JWT with `role: "admin"`).
- `GET /api/auth/me` - Retrieve authenticated user profile.

### Project PathFinder (`/api/pathfinder`)
- `POST /api/pathfinder/generate` - Generate deterministic engineering plan from project brief.
- `GET /api/pathfinder/plans` - List plans created by authenticated user.
- `GET /api/pathfinder/plans/:id` - Fetch plan details with DAG milestones and tasks.
- `PUT /api/pathfinder/plans/:id/replan` - Trigger dynamic replanning engine with progress preservation.
- `PUT /api/pathfinder/plans/:id/task` - Update task status (Not Started, In Progress, Completed) and assignee.
- `POST /api/pathfinder/plans/:id/export-to-workspace` - Export PathFinder plan into Project Kanban board.

### Campus Hackathons (`/api/hackathons`)
- `GET /api/hackathons` - Retrieve verified hackathons with registered squad metadata.
- `GET /api/hackathons/:id` - Retrieve hackathon details and participant teams.
- `POST /api/hackathons` - Create new campus hackathon (Admin only).
- `POST /api/hackathons/:id/register` - Register squad for a hackathon.

### Projects & Workspace (`/api/projects`)
- `GET /api/projects` - Retrieve deduplicated project cards.
- `POST /api/projects` - Create a new project workspace.
- `GET /api/projects/:id` - Retrieve project details and Kanban tasks.
- `PUT /api/projects/:id` - Update project details (title, description, repository, tags).
- `DELETE /api/projects/:id` - Delete project workspace.
- `POST /api/projects/:id/tasks` - Add task to project Kanban board.
- `PUT /api/projects/:id/tasks/:taskId` - Update task status or assignment.

### Teams & Skill Gap Analysis (`/api/teams`)
- `GET /api/teams` - List squads and membership status.
- `POST /api/teams` - Create a new squad.
- `GET /api/teams/:id` - Retrieve squad details with automated skill gap analysis.
- `POST /api/teams/:id/invite` - Send squad invitation to a student.

### Teammate Discovery (`/api/teammates`)
- `GET /api/teammates` - Search students with skill and graduation year filtering.

---

## Installation & Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- MongoDB (v6.0 or higher, running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/CampusCollab.git
cd CampusCollab
```

### 2. Backend Configuration & Setup
Navigate to the backend directory:
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/campuscollab
JWT_SECRET=your_jwt_secret_key_here
```

Start the backend server:
```bash
npm run dev
# or
node server.js
```
The server will start on `http://localhost:5000` and automatically seed the default administrator account and initial skill taxonomy.

### 3. Frontend Setup
In a new terminal, navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Default Administrator Credentials

CampusCollab includes an administrator account created during database initialization:

- Portal Route: `/admin-login`
- Email: `admin@campuscollab.edu`
- Password: `admin123`
- Privileges:
  - Add and configure verified campus hackathons directly from the Hackathons page.
  - Full event and workspace management permissions.

---

## Testing & Quality Assurance

### Backend Unit Tests
The PathFinder scheduling engine includes unit tests validating DAG cycle detection, dependency-ordered start times, stack preservation, and dynamic replanning:

```bash
cd backend
npm test
```

Test suite coverage:
- Problem statement decomposition and module structuring.
- Technology stack preservation in "I Know My Stack" mode.
- Heuristic skill-based task allocation across team members.
- Dependency-aware scheduling (prerequisite completion validation).
- Dynamic replanning preserving 100% of completed progress.

### Frontend Production Build
To verify production bundle compilation and syntax validity:

```bash
cd frontend
npm run build
```

---

## Design Guidelines & Zero-Icon Standard

CampusCollab adheres to a clean, distraction-free aesthetic:
- Minimalist Typography: Clear hierarchy using system fonts with deliberate weights.
- High-Contrast Monochrome Palette: Primary tokens rely on deep slates (`#0f172a`), clean borders (`#e2e8f0`), and crisp white surfaces.
- Zero-Icon Policy: All user interface actions and metrics use explicit, readable text labels and status badges rather than icon fonts or emoji characters.
- Responsive Layouts: Fluid flexbox and grid layouts supporting desktop, tablet, and mobile viewports.
