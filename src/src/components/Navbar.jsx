import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light custom-navbar sticky-top"
    >
      <div
        className="container"
      >
        <Link
          className="navbar-brand fs-4"
          to="/"
        >
          CampusCollab
        </Link>

        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span
            className="navbar-toggler-icon"
          >
          </span>
        </button>

        <div
          className="collapse navbar-collapse"
          id="navbarNav"
        >
          <ul
            className="navbar-nav ms-auto align-items-lg-center gap-lg-1"
          >
            {isAuthenticated && (
              <li
                className="nav-item"
              >
                <Link
                  className={`nav-link ${location.pathname === "/" || location.pathname === "/dashboard" ? "active" : ""}`}
                  to="/dashboard"
                >
                  Dashboard
                </Link>
              </li>
            )}

            <li
              className="nav-item"
            >
              <Link
                className={`nav-link ${isActive("/hackathons")}`}
                to="/hackathons"
              >
                Hackathons
              </Link>
            </li>

            <li
              className="nav-item"
            >
              <Link
                className={`nav-link ${isActive("/teams")}`}
                to="/teams"
              >
                Teams
              </Link>
            </li>

            <li
              className="nav-item"
            >
              <Link
                className={`nav-link ${isActive("/teammates")}`}
                to="/teammates"
              >
                Teammates
              </Link>
            </li>

            <li
              className="nav-item"
            >
              <Link
                className={`nav-link ${isActive("/projects")}`}
                to="/projects"
              >
                Projects
              </Link>
            </li>

            {isAuthenticated && (
              <li
                className="nav-item"
              >
                <Link
                  className={`nav-link ${isActive("/invitations")}`}
                  to="/invitations"
                >
                  Invitations
                </Link>
              </li>
            )}

            {isAuthenticated && user?.role === "admin" && (
              <li
                className="nav-item"
              >
                <Link
                  className={`nav-link text-primary fw-semibold ${isActive("/admin/hackathons")}`}
                  to="/admin/hackathons"
                >
                  Admin Panel
                </Link>
              </li>
            )}

            {isAuthenticated ? (
              <li
                className="nav-item ms-lg-3 mt-2 mt-lg-0"
              >
                <div
                  className="d-flex align-items-center gap-2"
                >
                  {/* Clicking profile name navigates directly to /profile */}
                  <Link
                    to="/profile"
                    className="btn btn-outline-custom btn-sm d-inline-flex align-items-center gap-2 py-1 px-2"
                    title="Click to view & edit My Profile"
                  >
                    <span
                      className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle"
                      style={{ width: "24px", height: "24px", fontSize: "0.75rem", fontWeight: "600" }}
                    >
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </span>

                    <span
                      className="fw-semibold text-dark small"
                    >
                      {user?.name || "My Profile"}
                    </span>

                    {user?.role === "admin" && (
                      <span
                        className="badge bg-primary-subtle text-primary border border-primary-subtle"
                        style={{ fontSize: "0.65rem", padding: "2px 5px" }}
                      >
                        Admin
                      </span>
                    )}
                  </Link>

                  <button
                    className="btn btn-outline-danger btn-sm py-1 px-2"
                    onClick={handleLogout}
                    title="Sign out"
                  >
                    Logout
                  </button>
                </div>
              </li>
            ) : (
              <li
                className="nav-item ms-lg-3 mt-2 mt-lg-0 d-flex gap-2"
              >
                <Link
                  className="btn btn-outline-custom btn-sm"
                  to="/login"
                >
                  Login
                </Link>

                <Link
                  className="btn btn-primary-custom btn-sm fw-semibold"
                  to="/register"
                >
                  Register
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;