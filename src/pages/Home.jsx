import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div
      className="home-page"
    >
      {/* Hero Section */}
      <section
        className="py-5 shadow-sm"
        style={{
          backgroundColor: "#0f172a",
          borderBottom: "1px solid #1e293b"
        }}
      >
        <div
          className="container py-4 text-center"
        >
          <div
            className="badge px-3 py-2 rounded-pill fw-semibold mb-3"
            style={{
              backgroundColor: "rgba(99, 102, 241, 0.15)",
              color: "#a5b4fc",
              border: "1px solid rgba(99, 102, 241, 0.3)"
            }}
          >
            Student Collaboration & Hackathon Platform
          </div>

          <h1
            className="display-4 fw-bold text-white mb-3"
          >
            Find Teammates & Build Hackathon Projects
          </h1>

          <p
            className="lead mb-4 mx-auto"
            style={{ maxWidth: "720px", color: "#94a3b8" }}
          >
            CampusCollab connects college students, matches complementary technology skills,
            and provides a shared workspace to coordinate hackathon preparations.
          </p>

          <div
            className="d-flex justify-content-center gap-3 flex-wrap"
          >
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="btn btn-primary-custom btn-lg fw-semibold px-4 shadow"
              >
                Go to Dashboard ({user?.name})
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn btn-primary-custom btn-lg fw-semibold px-4 shadow"
                >
                  Create Account
                </Link>

                <Link
                  to="/login"
                  className="btn btn-outline-light btn-lg px-4"
                >
                  Sign In
                </Link>
              </>
            )}

            <Link
              to="/hackathons"
              className="btn btn-outline-light btn-lg px-4"
            >
              Browse Hackathons
            </Link>
          </div>
        </div>
      </section>

      {/* Main Feature Workflow */}
      <section
        className="py-5"
      >
        <div
          className="container"
        >
          <div
            className="text-center mb-5"
          >
            <h2
              className="fw-bold text-primary mb-2"
            >
              Platform Workflow
            </h2>

            <p
              className="text-muted fs-5"
            >
              From student profile to team coordination
            </p>
          </div>

          <div
            className="row g-4"
          >
            <div
              className="col-md-4"
            >
              <div
                className="card h-100 border shadow-sm rounded-3 p-4 custom-card"
              >
                <h5
                  className="fw-bold text-primary mb-2"
                >
                  1. Developer Profile
                </h5>

                <p
                  className="text-muted small mb-0"
                >
                  List your technical stack, roles, GitHub username, and past projects so other students can discover you.
                </p>
              </div>
            </div>

            <div
              className="col-md-4"
            >
              <div
                className="card h-100 border shadow-sm rounded-3 p-4 custom-card"
              >
                <h5
                  className="fw-bold text-primary mb-2"
                >
                  2. Hackathons Discovery
                </h5>

                <p
                  className="text-muted small mb-0"
                >
                  Browse upcoming online, offline, and hybrid hackathons with registration deadlines and official links.
                </p>
              </div>
            </div>

            <div
              className="col-md-4"
            >
              <div
                className="card h-100 border shadow-sm rounded-3 p-4 custom-card"
              >
                <h5
                  className="fw-bold text-primary mb-2"
                >
                  3. Team Formation
                </h5>

                <p
                  className="text-muted small mb-0"
                >
                  Create a team for an event and specify what skills your squad needs to build the solution.
                </p>
              </div>
            </div>

            <div
              className="col-md-6"
            >
              <div
                className="card h-100 border shadow-sm rounded-3 p-4 custom-card"
              >
                <h5
                  className="fw-bold text-primary mb-2"
                >
                  4. Skill Matching & Gap Detection
                </h5>

                <p
                  className="text-muted mb-0"
                >
                  Identifies which required skills your squad is missing and suggests student peers who have those skills.
                </p>
              </div>
            </div>

            <div
              className="col-md-6"
            >
              <div
                className="card h-100 border shadow-sm rounded-3 p-4 custom-card"
              >
                <h5
                  className="fw-bold text-primary mb-2"
                >
                  5. Project Workspace & Tasks
                </h5>

                <p
                  className="text-muted mb-0"
                >
                  Track project tasks and feature implementation status with your teammates in a clean workspace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section
        className="bg-white py-5 border-top"
      >
        <div
          className="container text-center py-3"
        >
          <h3
            className="fw-bold text-dark mb-2"
          >
            Start Collaborating Today
          </h3>

          <p
            className="text-muted mb-4 fs-5"
          >
            Join your peers and build exciting projects.
          </p>

          <Link
            to="/register"
            className="btn btn-primary-custom btn-lg fw-semibold px-4 shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;