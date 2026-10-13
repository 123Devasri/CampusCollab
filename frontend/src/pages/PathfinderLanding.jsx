import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";

function PathfinderLanding() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/pathfinder");
      setPlans(res.data);
    } catch (err) {
      console.error("Fetch plans error:", err);
      setError(err.response?.data?.message || "Failed to load project plans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDeletePlan = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the roadmap for "${title}"?`)) {
      return;
    }
    try {
      setDeletingId(id);
      await API.delete(`/pathfinder/${id}`);
      setPlans((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete plan error:", err);
      alert(err.response?.data?.message || "Failed to delete plan.");
    } finally {
      setDeletingId(null);
    }
  };

  const getFeasibilityBadge = (score) => {
    if (score === "High Feasibility") {
      return <span className="badge bg-success-subtle text-success border">High Feasibility</span>;
    }
    if (score === "Moderate Feasibility") {
      return <span className="badge bg-warning-subtle text-warning-emphasis border">Moderate Feasibility</span>;
    }
    return <span className="badge bg-danger-subtle text-danger border">High Risk / Tight Scope</span>;
  };

  return (
    <div className="pathfinder-page py-4">
      <div className="container">
        {/* Hero Section */}
        <div className="card border-0 shadow-sm rounded-3 p-4 mb-4 bg-white" style={{ borderLeft: "4px solid var(--primary-color)" }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h3 className="fw-bold text-dark mb-0">Project PathFinder</h3>
                <span className="badge bg-primary-subtle text-primary border">Intelligent Roadmap Engine</span>
              </div>
              <p className="text-muted small mb-0" style={{ maxWidth: "680px" }}>
                Transform your problem statement into an actionable, team-aware, deadline-driven development roadmap.
                Designed for hackathon squads and student developers with dependency-aware task scheduling and dynamic replanning.
              </p>
            </div>
            <div className="d-flex gap-2">
              <Link to="/pathfinder/create" className="btn btn-primary-custom fw-semibold shadow-sm">
                Create Development Plan
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger py-2 mb-4" role="alert">
            {error}
          </div>
        )}

        {/* Saved Plans & Active Projects */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0">My Development Plans & Roadmaps ({plans.length})</h5>
          <Link to="/pathfinder/create" className="btn btn-outline-custom btn-sm fw-semibold">
            New Plan
          </Link>
        </div>

        {loading ? (
          <LoadingState message="Loading your Project PathFinder roadmaps..." />
        ) : plans.length > 0 ? (
          <div className="row g-4">
            {plans.map((plan) => (
              <div key={plan._id} className="col-lg-6">
                <div className="card border shadow-sm rounded-3 p-4 bg-white h-100 d-flex flex-column custom-card">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span className="badge bg-primary-subtle text-primary border small mb-1">
                        {plan.projectCategory || "Web Application"}
                      </span>
                      <h5 className="fw-bold text-primary mb-1 fs-5">
                        <Link to={`/pathfinder/${plan._id}`} className="text-decoration-none text-primary">
                          {plan.title}
                        </Link>
                      </h5>
                    </div>
                    {getFeasibilityBadge(plan.feasibility)}
                  </div>

                  <p className="text-muted small mb-2">
                    Squad: <strong>{plan.teamName}</strong> • Type: <span className="text-dark fw-medium">{plan.projectType}</span>
                  </p>

                  {/* Progress Bar */}
                  <div className="my-2">
                    <div className="d-flex justify-content-between small text-muted mb-1">
                      <span>Sprint Progress</span>
                      <span>
                        {plan.completedTasks} / {plan.totalTasks} tasks ({plan.progress}%)
                      </span>
                    </div>
                    <div className="progress" style={{ height: "7px" }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${plan.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="d-flex gap-2 flex-wrap text-muted small my-2">
                    <span>Deadline: <strong>{new Date(plan.finalDeadline).toLocaleDateString()}</strong></span>
                    {plan.blockedTasks > 0 && (
                      <span className="badge bg-danger-subtle text-danger border">
                        {plan.blockedTasks} Blocked
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-3 border-top d-flex gap-2">
                    <Link to={`/pathfinder/${plan._id}`} className="btn btn-primary-custom btn-sm flex-fill text-center">
                      Open Roadmap
                    </Link>
                    <button
                      onClick={() => handleDeletePlan(plan._id, plan.title)}
                      disabled={deletingId === plan._id}
                      className="btn btn-outline-danger btn-sm"
                      title="Delete Plan"
                    >
                      {deletingId === plan._id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Development Plans Created Yet"
            message="Ready to tackle a hackathon problem statement or semester project? Generate a complete roadmap with architecture guidance, assigned tasks, and a realistic timeline."
            actionText="Create Your First Development Plan"
            onActionClick={() => {
              window.location.href = "/pathfinder/create";
            }}
          />
        )}
      </div>
    </div>
  );
}

export default PathfinderLanding;
