import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import StudentProfile from "./pages/StudentProfile";
import Hackathon from "./pages/Hackathon";
import HackathonDetails from "./pages/HackathonDetails";
import AdminHackathons from "./pages/AdminHackathons";
import Teams from "./pages/Teams";
import TeamDetails from "./pages/TeamDetails";
import Teammates from "./pages/Teammates";
import Invitations from "./pages/Invitations";
import Project from "./pages/Project";
import ProjectDetails from "./pages/ProjectDetails";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <main
          className="main-content"
        >
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/:id"
              element={<StudentProfile />}
            />

            <Route
              path="/hackathons"
              element={<Hackathon />}
            />

            <Route
              path="/hackathons/:id"
              element={<HackathonDetails />}
            />

            <Route
              path="/admin/hackathons"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminHackathons />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teams"
              element={<Teams />}
            />

            <Route
              path="/teams/:id"
              element={<TeamDetails />}
            />

            <Route
              path="/teammates"
              element={<Teammates />}
            />

            <Route
              path="/students"
              element={<Navigate to="/teammates" replace />}
            />

            <Route
              path="/invitations"
              element={
                <ProtectedRoute>
                  <Invitations />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects"
              element={<Project />}
            />

            <Route
              path="/projects/:id"
              element={<ProjectDetails />}
            />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
