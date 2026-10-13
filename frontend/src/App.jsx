import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
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
import PathfinderLanding from "./pages/PathfinderLanding";
import PathfinderCreate from "./pages/PathfinderCreate";
import PathfinderDetails from "./pages/PathfinderDetails";

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
              path="/admin-login"
              element={<AdminLogin />}
            />

            <Route
              path="/admin/login"
              element={<AdminLogin />}
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
              element={
                <ProtectedRoute>
                  <StudentProfile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/hackathons"
              element={
                <ProtectedRoute>
                  <Hackathon />
                </ProtectedRoute>
              }
            />

            <Route
              path="/hackathons/:id"
              element={
                <ProtectedRoute>
                  <HackathonDetails />
                </ProtectedRoute>
              }
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
              element={
                <ProtectedRoute>
                  <Teams />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teams/:id"
              element={
                <ProtectedRoute>
                  <TeamDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teammates"
              element={<Navigate to="/teams?tab=teammates" replace />}
            />

            <Route
              path="/students"
              element={<Navigate to="/teams?tab=teammates" replace />}
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
              element={
                <ProtectedRoute>
                  <Project />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:id"
              element={
                <ProtectedRoute>
                  <ProjectDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pathfinder"
              element={
                <ProtectedRoute>
                  <PathfinderLanding />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pathfinder/create"
              element={
                <ProtectedRoute>
                  <PathfinderCreate />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pathfinder/:id"
              element={
                <ProtectedRoute>
                  <PathfinderDetails />
                </ProtectedRoute>
              }
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
