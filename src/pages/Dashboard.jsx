import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import LoadingState from "../components/LoadingState";
import SkillBadge from "../components/SkillBadge";
import Modal from "../components/Modal";

function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Expandable card state: track which hackathon is expanded
  const [expandedTeamId, setExpandedTeamId] = useState(null);

  // Create Project Modal state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    techStack: "",
    githubUrl: "",
    liveUrl: ""
  });
  const [creatingProject, setCreatingProject] = useState(false);

  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/dashboard");
      setData(res.data);

      // Auto-expand first registered hackathon if available
      const hackathons = res.data?.myRegisteredHackathons || [];
      if (hackathons.length > 0) {
        setExpandedTeamId(hackathons[0]._id);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRespondInvitation = async (invitationId, action) => {
    try {
      await API.put(`/invitations/${invitationId}`, { action });
      setSuccessMsg(`Invitation ${action === "accepted" ? "accepted" : "declined"}.`);
      fetchDashboardData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Invitation response error:", err);
      alert(err.response?.data?.message || "Failed to process invitation.");
    }
  };

  const handleOpenCreateProject = (team) => {
    setSelectedTeam(team);
    if (team.project) {
      setProjectForm({
        projectId: team.project._id,
        title: team.project.title,
        description: team.project.description,
        techStack: (team.project.techStack || []).join(", "),
        githubUrl: team.project.githubUrl || "",
        liveUrl: team.project.liveUrl || ""
      });
    } else {
      setProjectForm({
        projectId: null,
        title: `${team.name} Project`,
        description: `Project for ${team.hackathon?.name || team.hackathonName || "Hackathon"}`,
        techStack: (team.requiredSkills || []).join(", "),
        githubUrl: "",
        liveUrl: ""
      });
    }
    setShowProjectModal(true);
  };

  const handleCreateProjectSubmit = async (e) => {
    e.preventDefault();
    if (!projectForm.title.trim()) return;

    const techArr = projectForm.techStack
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      setCreatingProject(true);
      const res = await API.post("/projects", {
        projectId: projectForm.projectId || undefined,
        title: projectForm.title,
        description: projectForm.description,
        teamId: selectedTeam._id,
        hackathonId: selectedTeam.hackathon?._id || null,
        techStack: techArr,
        githubUrl: projectForm.githubUrl,
        liveUrl: projectForm.liveUrl,
        status: "Planning"
      });

      setShowProjectModal(false);
      setSuccessMsg(res.data.isUpdated ? "Project workspace updated for your hackathon team!" : "Project workspace created for your hackathon team!");
      fetchDashboardData();
      setTimeout(() => setSuccessMsg(""), 4000);
      navigate(`/projects/${res.data.project?._id}`);
    } catch (err) {
      console.error("Create project error:", err);
      alert(err.response?.data?.message || "Failed to create project.");
    } finally {
      setCreatingProject(false);
    }
  };

  const toggleExpand = (teamId) => {
    setExpandedTeamId((prev) => (prev === teamId ? null : teamId));
  };

  if (loading) {
    return <LoadingState message="Loading your dashboard..." />;
  }

  const registeredHackathons = data?.myRegisteredHackathons || [];
  const pendingInvitations = data?.pendingInvitations || [];
  const projectsCount = registeredHackathons.filter((t) => !!t.project).length;

  return (
    <div className="dashboard-page py-4">
      <div className="container">
        {/* Metric Stat Cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-lg-3">
            <div className="card border shadow-sm rounded-3 p-3 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted small fw-semibold">Registered Events</span>
                <span className="badge bg-primary-subtle text-primary">Hackathons</span>
              </div>
              <h3 className="fw-bold text-primary mb-0">{registeredHackathons.length}</h3>
              <span className="text-muted small mt-1">Active competitions</span>
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <div className="card border shadow-sm rounded-3 p-3 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted small fw-semibold">My Squads</span>
                <span className="badge bg-success-subtle text-success">Teams</span>
              </div>
              <h3 className="fw-bold text-success mb-0">{registeredHackathons.length}</h3>
              <span className="text-muted small mt-1">Formed squads</span>
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <div className="card border shadow-sm rounded-3 p-3 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted small fw-semibold">Team Projects</span>
                <span className="badge bg-info-subtle text-dark">Trackers</span>
              </div>
              <h3 className="fw-bold text-dark mb-0">{projectsCount}</h3>
              <span className="text-muted small mt-1">Active workspaces</span>
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <div className="card border shadow-sm rounded-3 p-3 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted small fw-semibold">Invitations</span>
                <span className="badge bg-warning-subtle text-warning-emphasis">Inbox</span>
              </div>
              <h3 className="fw-bold text-warning-emphasis mb-0">{pendingInvitations.length}</h3>
              <span className="text-muted small mt-1">Pending requests</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger py-2 mb-4 d-flex justify-content-between align-items-center" role="alert">
            <div><strong>Error:</strong> {error}</div>
            <button onClick={fetchDashboardData} className="btn btn-sm btn-outline-danger">Retry</button>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success alert-dismissible fade show py-2 mb-4" role="alert">
            {successMsg}
          </div>
        )}

        {/* Pending Invitations Box */}
        {pendingInvitations.length > 0 && (
          <div className="card border border-primary-subtle shadow-sm mb-4 bg-white rounded-3 p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-primary mb-0">
                Squad Invitations ({pendingInvitations.length})
              </h6>
              <Link to="/invitations" className="text-primary small fw-semibold text-decoration-none">
                View All →
              </Link>
            </div>
            <div className="row g-2">
              {pendingInvitations.map((inv) => (
                <div key={inv._id} className="col-md-6">
                  <div className="p-3 bg-light rounded border d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold text-dark mb-1">{inv.team?.name || "Hackathon Team"}</h6>
                      <p className="small text-muted mb-0">
                        Invited by <strong>{inv.invitedBy?.name}</strong> for {inv.team?.hackathonName || "Hackathon"}
                      </p>
                    </div>
                    <div className="d-flex gap-1">
                      <button
                        onClick={() => handleRespondInvitation(inv._id, "accepted")}
                        className="btn btn-success btn-sm fw-semibold"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespondInvitation(inv._id, "rejected")}
                        className="btn btn-outline-secondary btn-sm"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Registered Hackathons Section */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark mb-0">
              Registered Hackathons & Squads ({registeredHackathons.length})
            </h5>
            <Link to="/hackathons" className="btn btn-outline-custom btn-sm fw-semibold">
              + Explore More Hackathons
            </Link>
          </div>

          {registeredHackathons.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {registeredHackathons.map((team) => {
                const isExpanded = expandedTeamId === team._id;
                const project = team.project;
                const progressPct = project?.progress || 0;
                const completedTasks = project?.completedTasks || 0;
                const totalTasks = project?.totalTasks || 0;

                return (
                  <div
                    key={team._id}
                    className={`card border shadow-sm rounded-3 bg-white overflow-hidden custom-card ${
                      isExpanded ? "border-primary" : ""
                    }`}
                  >
                    {/* Header Bar - Click to Expand / Collapse */}
                    <div
                      className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2 cursor-pointer"
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleExpand(team._id)}
                    >
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className="badge bg-primary px-2 py-1">
                          {team.hackathon?.mode || "Online"}
                        </span>
                        <h5 className="fw-bold text-dark mb-0 fs-6">
                          {team.hackathon?.name || team.hackathonName}
                        </h5>
                        <span className="badge bg-secondary-subtle text-secondary border small">
                          Squad: {team.name}
                        </span>
                      </div>

                      <div className="d-flex align-items-center gap-3">
                        {project ? (
                          <span className="badge bg-success-subtle text-success border small">
                            {progressPct}% Finished ({completedTasks}/{totalTasks} tasks)
                          </span>
                        ) : (
                          <span className="badge bg-warning-subtle text-warning-emphasis border small">
                            Planning Stage
                          </span>
                        )}
                        <span className="text-primary small fw-semibold">
                          {isExpanded ? "▲ Collapse" : "▼ View Teammates & Project"}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Expanded Details */}
                    {isExpanded && (
                      <div className="p-4">
                        <div className="row g-4">
                          {/* Problem Statement & Project Progress */}
                          <div className="col-lg-7">
                            <div className="p-3 rounded border bg-light h-100">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="small text-uppercase fw-bold text-muted">
                                  Hackathon Project & Problem Goal:
                                </span>
                                {project && (
                                  <span className="badge bg-primary-subtle text-primary border small">
                                    {project.status || "In Progress"}
                                  </span>
                                )}
                              </div>

                              <h6 className="fw-bold text-dark mb-1">
                                {project?.title || `${team.name} Solution Proposal`}
                              </h6>
                              <p className="text-secondary small mb-3">
                                {project?.description ||
                                  team.description ||
                                  "No project statement drafted yet. Formulate your solution roadmap or launch a project workspace."}
                              </p>

                              {/* Progress: How much is over */}
                              <div className="mb-3">
                                <div className="d-flex justify-content-between small text-muted mb-1">
                                  <span>Completion Status</span>
                                  <span>
                                    <strong>{progressPct}% Completed</strong> ({completedTasks}/{totalTasks} tasks over)
                                  </span>
                                </div>
                                <div className="progress" style={{ height: "8px" }}>
                                  <div
                                    className="progress-bar"
                                    role="progressbar"
                                    style={{ width: `${progressPct}%` }}
                                  ></div>
                                </div>
                              </div>

                              <div className="d-flex gap-2 flex-wrap pt-2 border-top">
                                <Link
                                  to={`/teams/${team._id}`}
                                  className="btn btn-outline-custom btn-sm fw-semibold"
                                >
                                  Squad Workspace →
                                </Link>
                                {project ? (
                                  <Link
                                    to={`/projects/${project._id}`}
                                    className="btn btn-primary-custom btn-sm fw-semibold"
                                  >
                                    Open Kanban Tracker →
                                  </Link>
                                ) : (
                                  <button
                                    onClick={() => handleOpenCreateProject(team)}
                                    className="btn btn-primary-custom btn-sm fw-semibold"
                                  >
                                    + Start Project Workspace
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Teammates List */}
                          <div className="col-lg-5">
                            <div className="p-3 rounded border bg-light h-100">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="small text-uppercase fw-bold text-muted">
                                  Squad Teammates ({team.members?.length || 1}/{team.maxMembers || 4}):
                                </span>
                              </div>

                              <div className="d-flex flex-column gap-2">
                                {team.members?.map((m, mIdx) => (
                                  <div
                                    key={mIdx}
                                    className="p-2 rounded bg-white border d-flex align-items-center gap-2"
                                  >
                                    <div
                                      className="avatar-circle"
                                      style={{ width: "32px", height: "32px", fontSize: "0.85rem" }}
                                    >
                                      {m.user?.name ? m.user.name.charAt(0).toUpperCase() : "T"}
                                    </div>
                                    <div className="flex-fill">
                                      <div className="d-flex justify-content-between align-items-center">
                                        <Link
                                          to={`/profile/${m.user?._id}`}
                                          className="text-decoration-none fw-semibold text-dark small"
                                        >
                                          {m.user?.name || "Student"}
                                        </Link>
                                        {String(m.user?._id) === String(user?._id) && (
                                          <span className="badge bg-primary-subtle text-primary border" style={{ fontSize: "0.65rem" }}>
                                            You
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                        {m.role || m.user?.primaryRole || "Developer"}
                                      </div>
                                      <div className="d-flex flex-wrap gap-1 mt-1">
                                        {(m.user?.skills || []).slice(0, 2).map((s, sIdx) => (
                                          <span
                                            key={sIdx}
                                            className="badge bg-light text-dark border"
                                            style={{ fontSize: "0.68rem" }}
                                          >
                                            {s}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card border shadow-sm rounded-3 p-5 bg-white text-center">
              <h5 className="fw-bold text-dark mb-2">No Registered Hackathons Yet</h5>
              <p className="text-muted small mx-auto mb-4" style={{ maxWidth: "460px" }}>
                Join upcoming hackathons, assemble a squad, and start building your solution roadmap.
              </p>
              <div className="d-flex justify-content-center gap-2">
                <Link to="/hackathons" className="btn btn-primary-custom btn-sm fw-semibold">
                  Browse Hackathons
                </Link>
                <Link to="/teams" className="btn btn-outline-custom btn-sm fw-semibold">
                  Find Squads
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        title={`Create Project for ${selectedTeam?.name}`}
      >
        <form onSubmit={handleCreateProjectSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Project Title *</label>
            <input
              type="text"
              className="form-control"
              value={projectForm.title}
              onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small">Problem Statement & Description</label>
            <textarea
              className="form-control"
              rows="3"
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small">Technology Stack (comma separated)</label>
            <input
              type="text"
              className="form-control"
              value={projectForm.techStack}
              onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setShowProjectModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingProject}
              className="btn btn-primary-custom btn-sm fw-semibold"
            >
              {creatingProject ? "Creating..." : "Create Workspace"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Dashboard;
