# CampusCollab — Comprehensive Architecture, Tech Stack & Codebase Reading Guide

> A complete educational guide explaining every file, directory, concept, data flow, and algorithm across the entire CampusCollab application.

---

## Table of Contents
1. [Project Overview & Main Problem Solved](#1-project-overview--main-problem-solved)
2. [Full Technology Stack Breakdown](#2-full-technology-stack-breakdown)
3. [Folder & Directory Structure Overview](#3-folder--directory-structure-overview)
4. [Backend Architecture & File-by-File Guide](#4-backend-architecture--file-by-file-guide)
   - [Server Entry & Database](#server-entry--database)
   - [Mongoose Schemas & Data Models](#mongoose-schemas--data-models)
   - [Middleware & Security](#middleware--security)
   - [REST API Route Controllers](#rest-api-route-controllers)
5. [Frontend Architecture & File-by-File Guide](#5-frontend-architecture--file-by-file-guide)
   - [Application Entry & Routing](#application-entry--routing)
   - [Global Context & HTTP Services](#global-context--http-services)
   - [Reusable UI Components](#reusable-ui-components)
   - [Application Pages & Views](#application-pages--views)
6. [Core Algorithms & Business Logic](#6-core-algorithms--business-logic)
   - [Complementary Skill Gap Detection](#complementary-skill-gap-detection)
   - [Explainable Teammate Recommendation Engine](#explainable-teammate-recommendation-engine)
   - [Kanban Task Progress & Milestone Tracker](#kanban-task-progress--milestone-tracker)
7. [End-to-End Data Flow Diagrams](#7-end-to-end-data-flow-diagrams)
8. [Viva & Interview Quick-Reference](#8-viva--interview-quick-reference)

---

## 1. Project Overview & Main Problem Solved

### The Problem
In universities and colleges, students eager to compete in hackathons and software competitions often encounter four critical roadblocks:
1. **Skill Isolation & Team Imbalance**: Students usually form teams with immediate friends who have identical skills (e.g., three frontend developers and no backend or AI/ML specialist), resulting in unbalanced teams that struggle during competitions.
2. **Scattered Hackathon Announcements**: Events and registration deadlines are scattered across campus noticeboards, Discord servers, WhatsApp groups, and external sites (Unstop, Devpost).
3. **No Central Teammate Discovery**: Students with niche skills (e.g., PyTorch, MongoDB, DevOps) have no directory to find peers looking for those exact skills.
4. **Disorganized Pre-Hackathon Development**: Once a team is assembled, they lack a shared workspace to link GitHub repositories, set task priorities, and track milestones before submission.

### The Solution: CampusCollab
**CampusCollab** is a student collaboration web platform that:
- Aggregates verified campus hackathons, Unstop competitions, and global tech events.
- Employs **Rule-Based Complementary Skill Matching** to analyze team requirements, identify missing skills, and recommend specific peers.
- Enables students to build squads, manage join requests, and send team invitations.
- Provides a dedicated **Project Kanban Workspace** for every team to manage tasks (`Todo`, `In Progress`, `Completed`) and showcase GitHub repos and live demos.
- Gives administrators a streamlined portal to create and verify campus hackathons.

---

## 2. Full Technology Stack Breakdown

| Technology | Role in Project | Why It Was Chosen | Where It Is Used |
|---|---|---|---|
| **React.js (v19)** | Frontend UI Library | Component-based architecture, efficient state synchronization via Virtual DOM, declarative UI. | All user interfaces, cards, dashboards, forms, and modals. |
| **Vite (v8)** | Build Tool & Bundler | Extremely fast Hot Module Replacement (HMR), lightweight development server, modern ES module bundling. | `vite.config.js`, development server, production bundling. |
| **JavaScript (ES6+)** | Core Language | Async/Await, Destructuring, Spread operators, Arrow functions, Array methods (`map`, `filter`, `reduce`). | Both frontend components and Node.js backend. |
| **Bootstrap 5 & Custom CSS** | Design & Layout | High-contrast, clean human-designed UI with responsive grid systems, modals, badges, and cards. | `index.css`, Bootstrap utility classes throughout JSX. |
| **React Router (v7)** | Client-Side Routing | Dynamic URL routing without full page reloads, URL parameters (`/teams/:id`), route protection guards. | `src/App.jsx`, `ProtectedRoute.jsx`. |
| **Axios** | HTTP Client | Promise-based AJAX requests, automatic JSON transformation, global request interceptors for JWT injection. | `src/services/api.js`. |
| **Node.js** | Server Runtime | Event-driven, non-blocking asynchronous I/O runtime capable of handling concurrent API traffic. | Backend server execution (`backend/server.js`). |
| **Express.js** | Backend Web Framework | Lightweight RESTful routing, middleware pipelines (JSON parsing, CORS, JWT authentication). | `backend/server.js`, `backend/routes/*.js`. |
| **MongoDB** | NoSQL Database | Flexible document model, JSON-like document storage (BSON), dynamic schemas matching JavaScript objects. | Data store for users, teams, hackathons, projects. |
| **Mongoose (ODM)** | Database Modeling | Schema enforcement, validation rules, relationship population (`.populate()`), indexing. | `backend/models/*.js`. |
| **JSON Web Tokens (JWT)** | Authentication | Stateless authentication: generates cryptographically signed tokens containing user IDs for secure API access. | `backend/middleware/auth.js`, `backend/routes/auth.js`. |
| **bcryptjs** | Password Hashing | One-way cryptographic salting and hashing to securely store user passwords in the database. | `backend/routes/auth.js`, `backend/db.js`. |
| **GitHub REST API** | External Integration | Fetches live public repositories, star counts, programming languages, and bios for student profiles. | `backend/routes/github.js`, `StudentProfile.jsx`. |

---

## 3. Folder & Directory Structure Overview

```text
CampusCollab/
├── backend/                        # Node.js + Express + MongoDB Server
│   ├── config/                     # Configuration files (environment variables, constants)
│   ├── middleware/                 # Express middleware (JWT token verification)
│   ├── models/                     # Mongoose Object Data Models (database schemas)
│   ├── routes/                     # REST API route handlers (business logic & endpoints)
│   ├── cleanUsers.js               # Database cleanup & single-admin verification utility
│   ├── db.js                       # MongoDB connection & skill taxonomy seeder
│   ├── package.json                # Backend dependency manifest
│   └── server.js                   # Main server bootstrap file
├── frontend/                       # React.js + Vite Client Application
│   ├── public/                     # Static static assets (favicon, images)
│   ├── src/
│   │   ├── assets/                 # Icons, logos, and images
│   │   ├── components/             # Reusable, stateless and presentational UI components
│   │   ├── context/                # React Context API (global auth state)
│   │   ├── pages/                  # Route-level view components (Dashboard, Teams, etc.)
│   │   ├── services/               # HTTP client with Axios instance and interceptors
│   │   ├── App.css                 # Application-wide component styling
│   │   ├── App.jsx                 # Route definitions and application layout
│   │   ├── index.css               # Design system tokens, color variables, button styles
│   │   └── main.jsx                # React DOM root render entry
│   ├── index.html                  # Single Page Application HTML shell
│   ├── package.json                # Frontend dependency manifest
│   └── vite.config.js              # Vite bundler configuration
├── package.json                    # Root workspace orchestration scripts
├── README.md                       # GitHub repository documentation
└── COMPREHENSIVE_GUIDE.md          # Comprehensive reading & technical guide
```

---

## 4. Backend Architecture & File-by-File Guide

### Server Entry & Database

#### [`backend/server.js`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/backend/server.js)
- **Purpose**: Main entry point for the backend application.
- **What happens in this file**:
  1. Initializes an Express application instance.
  2. Configures middleware: `express.json()` to parse JSON bodies and `cors()` to allow cross-origin requests from the React frontend.
  3. Establishes the database connection by calling `connectDB()` from `db.js`.
  4. Mounts modular REST route handlers under the `/api/` prefix:
     - `/api/auth` -> `routes/auth.js`
     - `/api/dashboard` -> `routes/dashboard.js`
     - `/api/hackathons` -> `routes/hackathons.js`
     - `/api/teams` -> `routes/teams.js`
     - `/api/teammates` -> `routes/teammates.js`
     - `/api/projects` -> `routes/projects.js`
     - `/api/profile` -> `routes/profile.js`
     - `/api/invitations` -> `routes/invitations.js`
     - `/api/github` -> `routes/github.js`
     - `/api/skills` -> `routes/skills.js`
  5. Starts the HTTP server on port `5000` (or `process.env.PORT`).
- **Key Concepts**: Express routing, CORS handling, middleware pipeline, environment configuration.

---

#### [`backend/db.js`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/backend/db.js)
- **Purpose**: Connects to the MongoDB database and initializes required system taxonomy and the single platform administrator.
- **What happens in this file**:
  1. Calls `mongoose.connect()` using the URI from `process.env.MONGODB_URI` or defaults to `mongodb://127.0.0.1:27017/campuscollab`.
  2. Runs `seedSkillsTaxonomy()`: Checks if the `skills` collection is empty. If so, inserts 30+ standardized technical skills categorized by Programming, Frontend, Backend, Database, AI/ML, and DevOps.
  3. Runs `seedSingleAdmin()`: Checks if an admin account exists. If not, hashes `"123456"` with `bcrypt` and creates the single platform administrator (`admin@campuscollab.edu` / role: `"admin"`).
  4. Contains **zero mock student data** to guarantee a clean production database.
- **Key Concepts**: Database connectivity, idempotent seeding, password hashing with bcrypt, Mongoose models.

---

#### [`backend/cleanUsers.js`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/backend/cleanUsers.js)
- **Purpose**: Standalone database maintenance utility.
- **What happens in this file**:
  1. Deletes all user documents where `email !== "admin@campuscollab.edu"`.
  2. Verifies the single platform administrator exists.
  3. Clears orphaned test teams, projects, invitations, and join requests.
- **Key Concepts**: Database maintenance, bulk operations (`deleteMany`).

---

### Mongoose Schemas & Data Models

#### [`backend/models/User.js`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/backend/models/User.js)
- **Purpose**: Defines the student and administrator user profile schema.
- **Key Fields**:
  - `name` (String, Required): Full name.
  - `email` (String, Required, Unique, Lowercase): Authentication identifier.
  - `password` (String, Required): Bcrypt-hashed password.
  - `role` (String, Enum: `["user", "admin"]`, Default: `"user"`): Access level.
  - `college`, `course`, `year` (String): Academic background.
  - `primaryRole` (String): e.g. "Frontend Developer", "ML Developer".
  - `skills` ([String]): Array of technical skills (e.g. `["React", "Node.js"]`).
  - `githubUsername`, `linkedinUrl`, `bio` (String): External portfolio links.
- **Key Concepts**: Mongoose Schema definition, validation rules, unique indexes, enum constraints.

---

#### [`backend/models/Team.js`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/backend/models/Team.js)
- **Purpose**: Models hackathon squads, member rosters, and required skill criteria.
- **Key Fields**:
  - `name` (String, Required): Team name.
  - `hackathon` (ObjectId -> `Hackathon`): Linked competition event.
  - `hackathonName` (String): Fallback event title.
  - `createdBy` (ObjectId -> `User`): Team creator (Team Admin).
  - `requiredSkills` ([String]): Target skill profile required for the competition.
  - `maxMembers` (Number, Default: 4): Squad size ceiling.
  - `status` (String, Enum: `["Open", "Full", "Closed"]`).
  - `members`: Array of subdocuments `[{ user: ObjectId, role: String, joinedAt: Date }]`.
- **Key Concepts**: Subdocument arrays, ObjectId relationships, foreign key references.

---

#### [`backend/models/Hackathon.js`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/backend/models/Hackathon.js)
- **Purpose**: Stores verified hackathons created by campus administrators.
- **Key Fields**:
  - `name`, `organizer`, `description` (String, Required).
  - `startDate`, `endDate`, `registrationDeadline` (String).
  - `mode` (String, Enum: `["Online", "Offline", "Hybrid"]`).
  - `location`, `prizePool`, `technology`, `eligibility` (String).
  - `officialUrl` (String): Link to external organizer registration.
  - `isVerified` (Boolean, Default: `true`): Verification badge indicator.
- **Key Concepts**: Data normalization, date strings, URL validations.

---

#### [`backend/models/Project.js`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/backend/models/Project.js)
- **Purpose**: Stores project workspaces, repository links, and Kanban tasks.
- **Key Fields**:
  - `title`, `description` (String, Required).
  - `owner` (ObjectId -> `User`): Project creator.
  - `team` (ObjectId -> `Team`, Optional): Associated hackathon squad.
  - `hackathon` (ObjectId -> `Hackathon`, Optional): Target competition.
  - `techStack` ([String]): Technologies utilized in the project.
  - `githubUrl`, `liveUrl` (String): Public code and deployment links.
  - `status` (String: `"Planning"`, `"In Progress"`, `"Testing"`, `"Completed"`).
  - `tasks`: Subdocument array `[{ title, description, status: ("Todo"|"In Progress"|"Completed"), priority: ("Low"|"Medium"|"High"), assignedUser: ObjectId }]`.
- **Key Concepts**: Embedded subdocuments for Kanban task management, progress tracking.

---

#### [`backend/models/Invitation.js`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/backend/models/Invitation.js)
- **Purpose**: Tracks team invitations sent by Team Admins to prospective students.
- **Key Fields**: `team` (ObjectId), `invitedUser` (ObjectId), `invitedBy` (ObjectId), `message` (String), `status` (`"pending"`, `"accepted"`, `"rejected"`).

---

#### [`backend/models/JoinRequest.js`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/backend/models/JoinRequest.js)
- **Purpose**: Tracks applications sent by students requesting to join open teams.
- **Key Fields**: `team` (ObjectId), `user` (ObjectId), `message` (String), `status` (`"pending"`, `"accepted"`, `"rejected"`).

---

#### [`backend/models/Skill.js`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/backend/models/Skill.js)
- **Purpose**: Taxonomy catalogue of programming languages, frameworks, databases, and tools.
- **Key Fields**: `name` (String, Unique), `category` (String: `"Frontend"`, `"Backend"`, etc.).

---

### Middleware & Security

#### [`backend/middleware/auth.js`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/backend/middleware/auth.js)
- **Purpose**: Protects private REST endpoints using JSON Web Tokens.
- **What happens in this file**:
  1. Reads the `Authorization` header (`Bearer <token>`).
  2. Returns HTTP `401 Unauthorized` if token is missing.
  3. Verifies the token signature using `jwt.verify(token, JWT_SECRET)`.
  4. Attaches the decoded payload (`req.user = { id, email, role }`) to the request object.
  5. Calls `next()` to pass control to the route controller.
  6. Exports `requireAdmin` middleware to restrict administrator-only routes (`req.user.role === 'admin'`).
- **Key Concepts**: Stateless authentication, JWT verification, bearer token parsing, role-based access control (RBAC).

---

### REST API Route Controllers

#### [`backend/routes/auth.js`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/backend/routes/auth.js)
- **Endpoints**:
  - `POST /api/auth/register`: Validates name, email, password; hashes password with bcrypt; creates student (forces `role: "user"`); returns signed JWT and user payload.
  - `POST /api/auth/login`: Verifies email and password; compares bcrypt hash; returns signed JWT.
  - `GET /api/auth/me`: Protected route returning current logged-in user profile without password.
- **Key Concepts**: Input validation, password salting/hashing, JWT signing with expiration.

---

#### [`backend/routes/dashboard.js`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/backend/routes/dashboard.js)
- **Endpoints**:
  - `GET /api/dashboard`: Authenticated endpoint that aggregates:
    - User's registered hackathon squads (`Team.find({ "members.user": userId })`).
    - Teammates in each squad with their respective roles and skills.
    - Linked project workspaces with task progress calculations.
    - Pending incoming invitations and join requests.
- **Key Concepts**: Aggregation, database population, response transformation.

---

#### [`backend/routes/hackathons.js`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/backend/routes/hackathons.js)
- **Endpoints**:
  - `GET /api/hackathons`: Returns campus verified hackathons with search and mode filters.
  - `GET /api/hackathons/external`: Proxies external curated hackathon feeds (Unstop, global tech events) to avoid CORS issues.
  - `GET /api/hackathons/:id`: Retrieves full hackathon details, linked squads, and statistics.
  - `POST /api/hackathons`: Protected route (`requireAdmin`) to create a verified campus hackathon.
  - `PUT /api/hackathons/:id` & `DELETE /api/hackathons/:id`: Protected administrator updates and deletions.
- **Key Concepts**: Filtering via MongoDB RegExp, external API proxying, CRUD operations.

---

#### [`backend/routes/teams.js`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/backend/routes/teams.js)
- **Endpoints**:
  - `GET /api/teams`: Lists all teams with skill coverage percentages.
  - `GET /api/teams/my`: Retrieves all squads where the current user is a member (placed **before** `/:id` to prevent route collision).
  - `POST /api/teams`: Creates a new team; assigns creator as "Team Admin".
  - `GET /api/teams/:id`: Retrieves squad details, member profiles, skill gaps, linked project, and join requests.
  - `GET /api/teams/:id/recommendations`: Executes the **Complementary Skill Matching Algorithm** to find students who fill missing skills.
  - `POST /api/teams/:id/invite`: Team Admin sends an invitation to a peer.
  - `POST /api/teams/:id/join`: Student applies to join a team.
  - `PUT /api/teams/:id/requests/:requestId`: Team Admin accepts/rejects applicants.
  - `DELETE /api/teams/:id/members/:userId`: Removes a member from the squad.
- **Key Concepts**: Route ordering, ObjectId validation guards, recommendation ranking, membership workflows.

---

#### [`backend/routes/teammates.js`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/backend/routes/teammates.js)
- **Endpoints**:
  - `GET /api/teammates`: Searches and filters registered student developers by name, college, major, bio, primary role, and skills. Excludes administrator accounts.
- **Key Concepts**: Multi-field `$or` regex queries in MongoDB, projected fields.

---

#### [`backend/routes/projects.js`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/backend/routes/projects.js)
- **Endpoints**:
  - `GET /api/projects`: Lists campus projects with search and status filters.
  - `POST /api/projects`: Creates a project linked optionally to a hackathon squad.
  - `GET /api/projects/:id`: Retrieves project details, collaborators, and task list.
  - `POST /api/projects/:id/tasks`: Adds a new task to the project backlog (`Todo`, `In Progress`, `Completed`).
  - `PUT /api/projects/:id/tasks/:taskId`: Updates task status or reassigns task.
  - `DELETE /api/projects/:id/tasks/:taskId`: Deletes a task from the project.
- **Key Concepts**: Subdocument manipulation, Kanban state updates, task completion percentage calculation.

---

#### [`backend/routes/profile.js`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/backend/routes/profile.js)
- **Endpoints**:
  - `GET /api/profile`: Returns authenticated user's profile, squads, projects, and GitHub summary.
  - `PUT /api/profile`: Updates name, bio, skills, GitHub username, LinkedIn, college, course, and year.
  - `GET /api/profile/:id`: Public profile endpoint for viewing another student's skills, squads, projects, and contact info.
- **Key Concepts**: Profile data aggregation, self-update validations.

---

#### [`backend/routes/invitations.js`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/backend/routes/invitations.js)
- **Endpoints**:
  - `GET /api/invitations`: Returns incoming and outgoing team invitations for the current user.
  - `PUT /api/invitations/:id/respond`: Student accepts or declines a team invitation. On acceptance, automatically adds the user to `Team.members`.
- **Key Concepts**: Bidirectional invitation workflows, atomic squad membership updates.

---

#### [`backend/routes/github.js`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/backend/routes/github.js)
- **Endpoints**:
  - `GET /api/github/user/:username`: Safe proxy to `https://api.github.com/users/:username`.
  - `GET /api/github/repos/:username`: Safe proxy to `https://api.github.com/users/:username/repos`.
- **Key Concepts**: Safe external proxying, graceful 404 fallback handling without console pollution.

---

#### [`backend/routes/skills.js`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/backend/routes/skills.js)
- **Endpoints**:
  - `GET /api/skills`: Returns standardized skill taxonomy for autocomplete dropdowns.
- **Key Concepts**: Taxonomy categorization.

---

## 5. Frontend Architecture & File-by-File Guide

### Application Entry & Routing

#### [`frontend/src/main.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/main.jsx)
- **Purpose**: Application root mount.
- **What happens in this file**:
  - Imports Bootstrap CSS and `index.css`.
  - Mounts `<App />` inside React 19's `ReactDOM.createRoot(document.getElementById('root'))`.
- **Key Concepts**: Single Page Application DOM mounting.

---

#### [`frontend/src/App.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/App.jsx)
- **Purpose**: Defines the client-side router and route tree.
- **What happens in this file**:
  - Wraps the application inside `<AuthProvider>` and `<BrowserRouter>`.
  - Renders the global `<Navbar />`.
  - Routes configured:
    - `/` -> `<ProtectedRoute><Dashboard /></ProtectedRoute>` (Dashboard is the central home for authenticated students).
    - `/dashboard` -> `<ProtectedRoute><Dashboard /></ProtectedRoute>`
    - `/hackathons` -> `<Hackathon />`
    - `/hackathons/:id` -> `<HackathonDetails />`
    - `/teams` -> `<Teams />`
    - `/teams/:id` -> `<TeamDetails />`
    - `/teammates` -> `<Teammates />`
    - `/profile/:id` -> `<StudentProfile />`
    - `/projects` -> `<Project />`
    - `/projects/:id` -> `<ProjectDetails />`
    - `/invitations` -> `<ProtectedRoute><Invitations /></ProtectedRoute>`
    - `/profile` -> `<ProtectedRoute><Profile /></ProtectedRoute>`
    - `/admin/hackathons` -> `<ProtectedRoute requireAdmin={true}><AdminHackathons /></ProtectedRoute>`
    - `/login` -> `<Login />`
    - `/register` -> `<Register />`
- **Key Concepts**: React Router `<Routes>`, `<Route>`, `<ProtectedRoute>`, dynamic URL params.

---

#### [`frontend/src/index.css`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/index.css)
- **Purpose**: Unified design system tokens and custom CSS.
- **What happens in this file**:
  - Defines CSS variables for primary indigo (`#4338ca`), slate background (`#f8fafc`), card borders (`#e2e8f0`), text slate-900 (`#0f172a`), and emerald accents.
  - Implements `.custom-navbar`, `.btn-primary-custom`, `.custom-card`, `.card-hover-lift`, and `.avatar-circle`.
- **Key Concepts**: CSS Custom Properties (variables), typography hierarchy, card hover transformations.

---

### Global Context & HTTP Services

#### [`frontend/src/services/api.js`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/services/api.js)
- **Purpose**: Central Axios client for backend API communication.
- **What happens in this file**:
  1. Creates an Axios instance with `baseURL: "http://localhost:5000/api"` (or `VITE_API_URL`).
  2. Sets up a **Request Interceptor**: Reads `localStorage.getItem("token")` and attaches `Authorization: Bearer <token>` to every outgoing request.
  3. Sets up a **Response Interceptor**: Automatically logs out and clears token if the backend returns a `401 Unauthorized`.
- **Key Concepts**: Axios instances, interceptor pattern, JWT header injection, automatic token expiry handling.

---

#### [`frontend/src/context/AuthContext.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/context/AuthContext.jsx)
- **Purpose**: React Context providing global user authentication state.
- **What happens in this file**:
  - Stores `user`, `token`, `isAuthenticated`, and `loading` state.
  - Provides `login(email, password)`: Calls `/auth/login`, saves JWT to `localStorage`, updates state.
  - Provides `register(userData)`: Calls `/auth/register`, saves JWT, updates state.
  - Provides `logout()`: Clears `localStorage` and resets state.
  - Initializes session by calling `/auth/me` on startup if a token exists in `localStorage`.
- **Key Concepts**: React Context API (`createContext`, `useContext`), `useState`, `useEffect`, persistent sessions.

---

### Reusable UI Components

#### [`frontend/src/components/Navbar.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/components/Navbar.jsx)
- **Purpose**: Main navigation header across all pages.
- **Features**: Clean white design, Brand logo, NavLinks (`Dashboard`, `Hackathons`, `Teams`, `Teammates`, `Projects`, `Invitations`), Admin Panel link (shown only for `role === 'admin'`), user profile avatar, and Logout button.

#### [`frontend/src/components/ProtectedRoute.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/components/ProtectedRoute.jsx)
- **Purpose**: Route guard ensuring only logged-in users (or admins) can access protected views.

#### [`frontend/src/components/SkillBadge.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/components/SkillBadge.jsx)
- **Purpose**: Renders standardized pill badges for skills (supports `default`, `success` for covered skills, `warning` for missing skills).

#### [`frontend/src/components/SkillGapCard.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/components/SkillGapCard.jsx)
- **Purpose**: Visualizes team skill coverage percentage with a progress bar, covered skills chips (green), and missing skill chips (amber).

#### [`frontend/src/components/HackathonCard.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/components/HackathonCard.jsx)
- **Purpose**: Card displaying hackathon organizer, dates, mode badge, tech themes, prize pool, and "View Details / Create Team" actions.

#### [`frontend/src/components/ProjectCard.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/components/ProjectCard.jsx)
- **Purpose**: Card showcasing project title, description, team tag, status pill, tech stack badges, and GitHub/Demo links.

#### [`frontend/src/components/TeammateCard.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/components/TeammateCard.jsx)
- **Purpose**: Card showing student avatar, name, primary role, college, skills, direct contact email (`mailto:`), and "+ Add to Team" button.

#### [`frontend/src/components/Modal.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/components/Modal.jsx)
- **Purpose**: Accessible popup modal dialog with backdrop for forms and confirmations.

#### [`frontend/src/components/LoadingState.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/components/LoadingState.jsx) & [`EmptyState.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/components/EmptyState.jsx)
- **Purpose**: Consistent loading spinners and empty search/data placeholder cards.

---

### Application Pages & Views

#### [`frontend/src/pages/Dashboard.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/pages/Dashboard.jsx)
- **Purpose**: Primary home screen for logged-in students.
- **What happens**:
  - Displays all registered hackathons, squads, and teammates (with their roles and skills).
  - Displays linked project workspaces with task progress bars.
  - Features quick-action "+ Create Project with Teammates" modal.
  - Lists pending incoming/outgoing invitations.

#### [`frontend/src/pages/Hackathon.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/pages/Hackathon.jsx)
- **Purpose**: Hackathon discovery hub.
- **Features**: Category dropdown for **Campus Verified Hackathons**, **Unstop Competitions**, and **Global Tech Events**; mode filter; Admin login shortcut; "+ Add Verified Hackathon" admin form.

#### [`frontend/src/pages/HackathonDetails.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/pages/HackathonDetails.jsx)
- **Purpose**: Deep view of a single hackathon with official website link, prize details, eligibility, and squads recruiting for this event.

#### [`frontend/src/pages/AdminHackathons.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/pages/AdminHackathons.jsx)
- **Purpose**: Administrator management portal.
- **Features**: Prominent **`+ Add Hackathon`** button with inline form card to publish official hackathons; table of active hackathons with Edit and Delete actions.

#### [`frontend/src/pages/Teams.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/pages/Teams.jsx)
- **Purpose**: Squad discovery directory.
- **Features**: Lists all squads across hackathons with real-time skill-gap indicators; "+ Create Squad" modal.

#### [`frontend/src/pages/TeamDetails.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/pages/TeamDetails.jsx)
- **Purpose**: Team workspace.
- **Features**: Skill coverage breakdown, member roster, join request management, linked project tracker, and **Recommended Teammates** (students who fill missing skills).

#### [`frontend/src/pages/Teammates.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/pages/Teammates.jsx)
- **Purpose**: Student developer directory.
- **Features**: **Real-time search bar** (searches as you type), role filters, tech filters, direct contact email links, and "+ Add to Team" modal.

#### [`frontend/src/pages/StudentProfile.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/pages/StudentProfile.jsx)
- **Purpose**: Public profile page of a student.
- **Features**: Bio, academic info, skills, squads, GitHub repositories showcase, and direct contact email button.

#### [`frontend/src/pages/Project.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/pages/Project.jsx)
- **Purpose**: Campus project directory.
- **Features**: Real-time project search, status filter, and **`+ Add Project to Work On`** modal with squad selector.

#### [`frontend/src/pages/ProjectDetails.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/pages/ProjectDetails.jsx)
- **Purpose**: Interactive 3-column Kanban project workspace (`Todo`, `In Progress`, `Completed`) with task creation, priority tags, and completion progress metrics.

#### [`frontend/src/pages/Invitations.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/pages/Invitations.jsx)
- **Purpose**: Notifications center to Accept or Decline team invitations and track sent requests.

#### [`frontend/src/pages/Profile.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/pages/Profile.jsx)
- **Purpose**: Student profile editor (update bio, skills, GitHub username, LinkedIn, college).

#### [`frontend/src/pages/Login.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/pages/Login.jsx) & [`Register.jsx`](file:///c:/Users/devasri/OneDrive/Desktop/projects/CampusCollab/frontend/src/pages/Register.jsx)
- **Purpose**: Clean authentication pages for signing in or creating a new student account.

---

## 6. Core Algorithms & Business Logic

### Complementary Skill Gap Detection
Calculates the exact technical readiness of a hackathon squad:

$$\text{Coverage Percentage} = \left( \frac{|\text{Covered Skills}|}{|\text{Required Skills}|} \right) \times 100$$

```javascript
// Step 1: Collect union of all skills possessed by team members
const memberSkillsSet = new Set();
team.members.forEach((m) => {
  if (m.user && Array.isArray(m.user.skills)) {
    m.user.skills.forEach((s) => memberSkillsSet.add(s.toLowerCase()));
  }
});

// Step 2: Classify required skills into covered vs missing
const coveredSkills = [];
const missingSkills = [];

(team.requiredSkills || []).forEach((reqSkill) => {
  if (memberSkillsSet.has(reqSkill.toLowerCase())) {
    coveredSkills.push(reqSkill);
  } else {
    missingSkills.push(reqSkill);
  }
});

const coveragePercentage = Math.round((coveredSkills.length / team.requiredSkills.length) * 100);
```

---

### Explainable Teammate Recommendation Engine
Ranks non-team students by how many missing skills they cover:

```javascript
// Candidates who are not already in the team
const candidates = await User.find({ _id: { $nin: memberUserIds }, role: { $ne: "admin" } });

candidates.forEach((student) => {
  const studentSkills = student.skills || [];
  const matchedMissing = [];

  missingSkills.forEach((missingSkill) => {
    const hasSkill = studentSkills.some((s) =>
      s.toLowerCase().includes(missingSkill.toLowerCase()) ||
      missingSkill.toLowerCase().includes(s.toLowerCase())
    );
    if (hasSkill) matchedMissing.push(missingSkill);
  });

  if (matchedMissing.length > 0) {
    const scoreFraction = matchedMissing.length / missingSkills.length;
    const fitScore = Math.round(65 + scoreFraction * 30);
    const reason = `Matches missing skills in ${matchedMissing.join(", ")}.`;

    recommendations.push({ student, fitScore, matchedSkills: matchedMissing, reason });
  }
});

// Sort candidates by fit score descending
recommendations.sort((a, b) => b.fitScore - a.fitScore);
```

---

### Kanban Task Progress & Milestone Tracker
Calculates real-time completion percentage of project feature tasks:

$$\text{Progress} = \left( \frac{\text{Completed Tasks}}{\text{Total Tasks}} \right) \times 100$$

---

## 7. End-to-End Data Flow Diagrams

### Authentication & API Request Pipeline
```
[User Browser]
      │  (Email, Password)
      ▼
[POST /api/auth/login] ──► [bcrypt.compare] ──► [Sign JWT Token]
                                                      │
[React AuthContext] ◄─────────────────────────────────┘ (JWT Token)
      │  (Stores token in localStorage)
      ▼
[Axios Request Interceptor] ──► [Headers: Authorization: Bearer <token>]
      │
      ▼
[Backend auth Middleware] ──► [jwt.verify()] ──► [req.user = decoded]
      │
      ▼
[Route Controller (e.g. GET /api/dashboard)] ──► [MongoDB Query] ──► [JSON Response]
```

### Squad Formation & Teammate Recruitment Flow
```
[Team Admin] ──► Creates Squad with Required Skills (e.g., React, Node.js, AI/ML)
      │
      ▼
[Skill Gap Detection] ──► Identifies Missing Skills: ["AI/ML"]
      │
      ▼
[Recommendation Engine] ──► Finds peers possessing "AI/ML"
      │
      ▼
[Team Admin clicks "+ Add to Team"] ──► Sends Invitation (POST /api/teams/:id/invite)
      │
      ▼
[Peer opens Invitations Tab] ──► Clicks "Accept"
      │
      ▼
[Backend] ──► Adds peer to Team.members ──► Skill Gap Recomputed (Coverage -> 100%)
```

---

## 8. Viva & Interview Quick-Reference

1. **Why use JWT instead of sessions?**
   - JWT is stateless. The server doesn't need to store session IDs in memory or Redis. Scalable, self-contained, and easily verified across microservices.
2. **Why use Mongoose `.populate()`?**
   - MongoDB documents store references as `ObjectId`. `.populate()` performs a lookup to replace those ObjectIds with the full referenced document (e.g., user details inside team members).
3. **How does the Complementary Skill Matching work?**
   - It computes the set difference between the team's target `requiredSkills` and the union of all members' `skills`. Candidates who fill missing skills are scored and ranked with explainable reasons.
4. **How are routes protected on the frontend and backend?**
   - **Frontend**: `<ProtectedRoute>` checks `isAuthenticated`. If false, redirects to `/login`.
   - **Backend**: `authenticate` middleware checks the JWT in the `Authorization` header. If missing/invalid, responds with `401 Unauthorized`.
5. **How are race conditions and route collisions prevented?**
   - Static routes (e.g., `/api/teams/my`) are registered before parameterized routes (`/api/teams/:id`), and all IDs are validated using `mongoose.Types.ObjectId.isValid()`.
