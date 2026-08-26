# CampusCollab — Student Collaboration & Hackathon Platform

> A student collaboration platform designed to discover hackathons, match complementary technology skill sets, form balanced squads, and coordinate project development in shared workspaces.

---

## 📌 The Problem

College students and aspiring developers often face significant challenges when preparing for hackathons and software competitions:

1. **Skill Isolation & Team Imbalance**: Students often form teams only with close friends who share identical skills (e.g., three frontend developers and no backend or AI/ML specialist), leading to critical technical gaps during competition time.
2. **Fragmented Event Discovery**: Hackathon notices and competition deadlines are scattered across disparate social media groups, university noticeboards, and various platforms.
3. **Lack of Pre-Hackathon Coordination**: After forming a team, students lack a lightweight, dedicated workspace to plan feature tasks, track milestone progress, and link GitHub repositories before the hackathon begins.

---

## 💡 The Solution

**CampusCollab** bridges this gap with an intuitive, student-friendly platform:

- **Rule-Based Complementary Skill Matching**: Automatically analyzes team technical requirements against member skill sets to detect missing skills and suggest peers who fill those exact gaps.
- **Unified Hackathon Hub**: Discover verified campus hackathons, curated Unstop competitions, and global tech events with official registration links.
- **Team Workspaces & Invitation System**: Form squads, review join requests, send invitations, and track team readiness.
- **Hackathon Project Task Board**: Manage features in a 3-column workflow (`Todo`, `In Progress`, `Completed`) with progress tracking.
- **Form-Based Admin Verification**: Allows campus coordinators and administrators to add, verify, and manage official hackathons directly through a simple form.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React.js (Vite), JavaScript (ES6+), Bootstrap 5, Custom Unified Design System |
| **Backend** | Node.js, Express.js, RESTful APIs |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), bcrypt.js password hashing |
| **Integrations** | GitHub REST API, External Hackathon Feed Proxy |

---

## 🚀 Key Features

### 1. 🎯 Direct Student Dashboard
- Instant view of all registered hackathons, squads, and teammates.
- Linked project workspaces with task progress percentages.
- One-click project creation pre-filled with team details.
- Notification center for incoming and outgoing team invitations.

### 2. 🔍 Hackathon Discovery & Source Filter
- Dropdown selector for **Campus Verified Hackathons**, **Unstop Competitions**, and **Global Tech Events**.
- Search by hackathon name, tech themes (AI, Cloud, Web3), or mode (Online, Offline, Hybrid).
- Direct redirection to official organizers for genuine registration.

### 3. 👥 Squad Formation & Skill-Gap Analysis
- Calculates team skill coverage percentage:
  $$\text{Coverage} = \left( \frac{\text{Covered Skills}}{\text{Required Skills}} \right) \times 100$$
- Visual indicators for covered skills (Emerald) vs missing skills (Amber).
- Explains why a peer is recommended (e.g., *"Matches team requirements for Python and Machine Learning which your team currently needs"*).

### 4. 📋 Project Workspace & Kanban Feature Tracker
- 3-column status board: `Todo`, `In Progress`, and `Completed`.
- Task priority markers: `Low`, `Medium`, `High`.
- Repository & Live Demo showcase with collaborator request management.

### 5. 🛡️ Admin Verification & Form-Based Hackathon Management
- Choose **Account Type: Campus Coordinator / Admin** during registration to gain full privileges.
- Add campus verified hackathons directly using the form with name, organizer, mode, dates, prize pool, and official registration URL.

---

## 📂 Clean Project Structure

```text
CampusCollab/
├── backend/
│   ├── config/             # Database connection & MongoDB setup
│   ├── middleware/         # JWT authentication & role-checking middleware
│   ├── models/             # Mongoose schemas (User, Team, Project, Hackathon, Invitation)
│   ├── routes/             # REST API routes (auth, dashboard, hackathons, teams, projects)
│   ├── db.js               # Database connection & skill taxonomy initializer
│   ├── package.json        # Backend dependencies
│   └── server.js           # Express server entry point
├── frontend/
│   ├── public/             # Public assets
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, SkillBadge, SkillGapCard, Modal, etc.)
│   │   ├── context/        # AuthContext for JWT session state
│   │   ├── pages/          # Application views (Dashboard, Hackathon, Teams, Teammates, Project)
│   │   ├── services/       # Axios API client
│   │   ├── App.jsx         # React router configuration
│   │   ├── index.css       # Unified design system & color tokens
│   │   └── main.jsx        # Application root
│   ├── index.html          # HTML entry point
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite build configuration
├── package.json            # Root scripts
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/CampusCollab.git
cd CampusCollab
```

### 2. Backend Setup
```bash
cd backend
npm install
node server.js
```
The server will start on port `5000` and connect to MongoDB.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 REST API Summary

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register` | `POST` | Register a new student or admin account |
| `/api/auth/login` | `POST` | Authenticate user & return JWT token |
| `/api/dashboard` | `GET` | Retrieve registered hackathons, squads, and projects |
| `/api/hackathons` | `GET`, `POST` | List and create verified hackathons |
| `/api/teams` | `GET`, `POST` | Browse squads and initialize new hackathon team |
| `/api/teams/:id/invite` | `POST` | Send invitation to a peer student |
| `/api/projects` | `GET`, `POST` | List campus projects and create team workspace |
| `/api/projects/:id/tasks` | `POST`, `PUT`, `DELETE` | Manage feature backlog tasks |

---

## 📄 License
Distributed under the MIT License. Feel free to use and adapt for academic and student collaboration purposes.
