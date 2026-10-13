import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer
      className="bg-white border-top mt-auto py-4"
      style={{ borderColor: "var(--border-color)" }}
    >
      <div
        className="container"
      >
        <div
          className="row g-4 py-3"
        >
          {/* Brand Info */}
          <div
            className="col-lg-4 col-md-6"
          >
            <div
              className="d-flex align-items-center gap-2 mb-2"
            >
              <span
                className="brand-icon-badge"
              >
                C
              </span>

              <span
                className="fw-bold fs-5 text-dark"
              >
                CampusCollab
              </span>
            </div>

            <p
              className="text-muted small mb-3"
              style={{ maxWidth: "340px", lineHeight: "1.6" }}
            >
              A student collaboration and hackathon platform designed to match complementary technical skills, form balanced squads, and build winning projects.
            </p>

            <div
              className="d-flex align-items-center gap-2"
            >
              <span
                className="badge bg-success-subtle text-success border border-success-subtle"
                style={{ fontSize: "0.75rem" }}
              >
                ● System Live
              </span>

              <span
                className="text-muted small"
              >
                MongoDB Connected
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div
            className="col-lg-2 col-md-3 col-6"
          >
            <h6
              className="fw-bold text-dark mb-3 small text-uppercase letter-spacing-1"
            >
              Discovery
            </h6>

            <ul
              className="list-unstyled d-flex flex-column gap-2 small mb-0"
            >
              <li>
                <Link
                  to="/hackathons"
                  className="text-secondary text-decoration-none hover-primary"
                >
                  Hackathons Hub
                </Link>
              </li>

              <li>
                <Link
                  to="/teams"
                  className="text-secondary text-decoration-none hover-primary"
                >
                  Browse Squads
                </Link>
              </li>

              <li>
                <Link
                  to="/teammates"
                  className="text-secondary text-decoration-none hover-primary"
                >
                  Find Teammates
                </Link>
              </li>

              <li>
                <Link
                  to="/projects"
                  className="text-secondary text-decoration-none hover-primary"
                >
                  Project Workspaces
                </Link>
              </li>
            </ul>
          </div>

          {/* Workspace Links */}
          <div
            className="col-lg-3 col-md-3 col-6"
          >
            <h6
              className="fw-bold text-dark mb-3 small text-uppercase letter-spacing-1"
            >
              Student Portal
            </h6>

            <ul
              className="list-unstyled d-flex flex-column gap-2 small mb-0"
            >
              <li>
                <Link
                  to="/dashboard"
                  className="text-secondary text-decoration-none hover-primary"
                >
                  Student Dashboard
                </Link>
              </li>

              <li>
                <Link
                  to="/invitations"
                  className="text-secondary text-decoration-none hover-primary"
                >
                  Team Invitations
                </Link>
              </li>

              <li>
                <Link
                  to="/profile"
                  className="text-secondary text-decoration-none hover-primary"
                >
                  Developer Profile
                </Link>
              </li>

              <li>
                <Link
                  to="/admin/login"
                  className="text-secondary text-decoration-none hover-primary"
                >
                  Coordinator Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology & Standards */}
          <div
            className="col-lg-3 col-md-12"
          >
            <h6
              className="fw-bold text-dark mb-3 small text-uppercase letter-spacing-1"
            >
              Technical Core
            </h6>

            <p
              className="text-muted small mb-2"
            >
              Rule-based skill matching algorithm & Kanban project feature tracking.
            </p>

            <div
              className="d-flex flex-wrap gap-1"
            >
              <span
                className="badge bg-light text-secondary border"
              >
                React 19
              </span>

              <span
                className="badge bg-light text-secondary border"
              >
                Node.js
              </span>

              <span
                className="badge bg-light text-secondary border"
              >
                MongoDB
              </span>

              <span
                className="badge bg-light text-secondary border"
              >
                Bootstrap 5
              </span>

              <span
                className="badge bg-light text-secondary border"
              >
                JWT Auth
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="border-top pt-3 mt-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 small text-muted"
        >
          <div>
            &copy; {new Date().getFullYear()} CampusCollab. Built for University & College Hackathons.
          </div>

          <div
            className="d-flex gap-3"
          >
            <span>Production Ready</span>
            <span>•</span>
            <span>REST API Active</span>
            <span>•</span>
            <span>Zero Mock Data</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
