# CampusCollab — Student Collaboration & Hackathon Platform

> A student collaboration platform designed to discover hackathons, match complementary technology skill sets, form balanced squads, and coordinate project development in shared workspaces.

---

##  The Problem

Students often struggle to discover hackathons, find teammates with complementary skills, and coordinate project development after forming a team.


---

##  The Solution
CampusCollab is a student collaboration platform that brings hackathon discovery, skill-based teammate matching, team formation, project task management, and GitHub integration into one platform.


---

##  Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React.js (Vite), JavaScript (ES6+), Bootstrap 5, Custom Unified Design System |
| **Backend** | Node.js, Express.js, RESTful APIs |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), bcrypt.js password hashing |
| **Integrations** | GitHub REST API, External Hackathon Feed Proxy |

---

##  Key Features

- **Hackathon Discovery** – Discover campus, Unstop, and other hackathons with source filtering and direct registration links.
- **Skill-Based Team Matching** – Find teammates based on complementary technical skills and identify missing skills in a team.
- **Team Invitations & Requests** – Create teams, invite students, and manage join requests.
- **Project Workspace** – Create projects, assign team tasks, and track work using a Todo, In Progress, and Completed workflow.
- **GitHub Integration** – Add GitHub profiles and connect project repositories for development collaboration.
- **Admin Hackathon Management** – Admins can add, verify, and manage hackathons through a form-based interface.
- **Authentication** – Secure registration, login, JWT-based sessions, and role-based access.

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
