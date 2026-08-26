import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import LoadingState from "../components/LoadingState";
import SkillBadge from "../components/SkillBadge";
import SkillGapCard from "../components/SkillGapCard";
import Modal from "../components/Modal";

function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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
    setProjectForm({
      title: `${team.name} Project`,
      description: `Project for ${team.hackathon?.name || team.hackathonName || "Hackathon"}`,
      techStack: (team.requiredSkills || []).join(", "),
      githubUrl: "",
      liveUrl: ""
    });
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
      setSuccessMsg("Project workspace created for your hackathon team!");
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

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  const registeredHackathons = data?.myRegisteredHackathons || [];

  return (
    <div
      className="dashboard-page py-4"
    >
      <div
        className="container"
      >
        {/* Simple & Clean Header */}
        <div
          className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 pb-3 border-bottom"
        >
          <div>
            <h2
              className="fw-bold text-primary mb-1"
            >
              Welcome back, {user?.name || "Student"}
            </h2>

            <p
              className="text-muted mb-0"
            >
              {user?.primaryRole || "Developer"} • {user?.college || "University"}
            </p>
          </div>

          <div
            className="d-flex gap-2"
          >
            <Link
              to="/hackathons"
              className="btn btn-primary-custom btn-sm fw-semibold"
            >
              Browse Hackathons
            </Link>

            <Link
              to="/profile"
              className="btn btn-outline-custom btn-sm"
            >
              My Profile
            </Link>
          </div>
        </div>

        {error && (
          <div
            className="alert alert-danger py-3 mb-4 d-flex justify-content-between align-items-center"
            role="alert"
          >
            <div>
              <strong>Error:</strong> {error}
            </div>

            <button
              onClick={fetchDashboardData}
              className="btn btn-sm btn-outline-danger"
            >
              Retry
            </button>
          </div>
        )}

        {successMsg && (
          <div
            className="alert alert-success alert-dismissible fade show py-2 mb-4"
            role="alert"
          >
            {successMsg}
          </div>
        )}

        {/* Pending Invitations Alert */}
        {data?.pendingInvitations && data.pendingInvitations.length > 0 && (
          <div
            className="alert alert-primary shadow-sm mb-4 border"
          >
            <h6
              className="fw-bold mb-2 text-primary"
            >
              You have {data.pendingInvitations.length} Pending Team Invitation(s)
            </h6>

            <div
              className="row g-2"
            >
              {data.pendingInvitations.map((inv) => (
                <div
                  key={inv._id}
                  className="col-md-6"
                >
                  <div
                    className="p-3 bg-white rounded border d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h6
                        className="fw-bold text-primary mb-1"
                      >
                        {inv.team?.name || "Hackathon Team"}
                      </h6>

                      <p
                        className="small text-muted mb-0"
                      >
                        Invited by {inv.invitedBy?.name} for {inv.team?.hackathonName}
                      </p>
                    </div>

                    <div
                      className="d-flex gap-1"
                    >
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

        {/* Section: Registered Hackathons, Teams & Projects */}
        <div
          className="mb-4"
        >
          <div
            className="d-flex justify-content-between align-items-center mb-3"
          >
            <div>
              <h4
                className="fw-bold text-dark mb-1"
              >
                My Registered Hackathons & Teams
              </h4>

              <p
                className="text-muted small mb-0"
              >
                Your active hackathon participations, teammates, and linked project workspaces.
              </p>
            </div>

            <Link
              to="/teams"
              className="btn btn-outline-custom btn-sm fw-semibold"
            >
              Browse All Teams
            </Link>
          </div>

          {registeredHackathons.length > 0 ? (
            <div
              className="d-flex flex-column gap-4"
            >
              {registeredHackathons.map((team) => (
                <div
                  key={team._id}
                  className="card border shadow-sm rounded-3 bg-white overflow-hidden custom-card"
                >
                  {/* Card Header: Hackathon & Team Info */}
                  <div
                    className="p-4 bg-light border-bottom d-flex justify-content-between align-items-start flex-wrap gap-3"
                  >
                    <div>
                      <div
                        className="d-flex align-items-center gap-2 mb-1 flex-wrap"
                      >
                        <span
                          className="badge bg-primary px-3 py-1"
                        >
                          {team.hackathon?.mode || "Hackathon"}
                        </span>

                        <span
                          className="badge bg-secondary-subtle text-secondary border small"
                        >
                          Team: {team.name}
                        </span>

                        {team.hackathon?.registrationDeadline && (
                          <span
                            className="text-muted small fw-semibold"
                          >
                            Deadline: {team.hackathon.registrationDeadline}
                          </span>
                        )}
                      </div>

                      <h4
                        className="fw-bold text-primary mb-1"
                      >
                        {team.hackathon?.name || team.hackathonName}
                      </h4>

                      <p
                        className="text-muted small mb-0"
                      >
                        Organized by <strong>{team.hackathon?.organizer || "Organizer"}</strong> • Admin: <strong>{team.createdBy?.name}</strong>
                      </p>
                    </div>

                    <div
                      className="d-flex gap-2"
                    >
                      <Link
                        to={`/teams/${team._id}`}
                        className="btn btn-outline-primary btn-sm fw-semibold"
                      >
                        Team Workspace
                      </Link>

                      {team.hackathon?.officialUrl && (
                        <a
                          href={team.hackathon.officialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline-success btn-sm fw-semibold"
                        >
                          Official Portal ↗
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Card Body: Teammates & Linked Project */}
                  <div
                    className="p-4"
                  >
                    <div
                      className="row g-4"
                    >
                      {/* Left: Teammates List */}
                      <div
                        className="col-lg-6"
                      >
                        <h6
                          className="fw-bold text-dark mb-3"
                        >
                          Teammates ({team.members?.length || 0}/{team.maxMembers || 4}):
                        </h6>

                        <div
                          className="d-flex flex-column gap-2"
                        >
                          {team.members?.map((m, mIdx) => (
                            <div
                              key={mIdx}
                              className="p-3 rounded border bg-light d-flex justify-content-between align-items-center"
                            >
                              <div
                                className="d-flex align-items-center gap-3"
                              >
                                <div
                                  className="avatar-circle"
                                >
                                  {m.user?.name ? m.user.name.charAt(0).toUpperCase() : "T"}
                                </div>

                                <div>
                                  <h6
                                    className="fw-bold text-dark mb-0"
                                  >
                                    <Link
                                      to={`/profile/${m.user?._id}`}
                                      className="text-decoration-none text-dark"
                                    >
                                      {m.user?.name || "Student"}
                                    </Link>
                                    {String(m.user?._id) === String(user?._id) && (
                                      <span
                                        className="badge bg-primary-subtle text-primary border ms-2 small"
                                      >
                                        You
                                      </span>
                                    )}
                                  </h6>

                                  <p
                                    className="text-muted small mb-1"
                                  >
                                    {m.role || m.user?.primaryRole || "Developer"}
                                  </p>

                                  <div
                                    className="d-flex flex-wrap gap-1"
                                  >
                                    {(m.user?.skills || []).slice(0, 3).map((s, sIdx) => (
                                      <SkillBadge
                                        key={sIdx}
                                        name={s}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Linked Project & Skill Gap */}
                      <div
                        className="col-lg-6"
                      >
                        <div
                          className="mb-4"
                        >
                          <h6
                            className="fw-bold text-dark mb-2"
                          >
                            Hackathon Project Workspace:
                          </h6>

                          {team.project ? (
                            <div
                              className="p-3 rounded border bg-white shadow-sm"
                            >
                              <div
                                className="d-flex justify-content-between align-items-start mb-2"
                              >
                                <h5
                                  className="fw-bold text-primary mb-0 fs-5"
                                >
                                  {team.project.title}
                                </h5>

                                <span
                                  className="badge bg-primary-subtle text-primary border small"
                                >
                                  {team.project.status}
                                </span>
                              </div>

                              <p
                                className="text-secondary small mb-3 text-truncate-2"
                              >
                                {team.project.description}
                              </p>

                              {team.project.totalTasks > 0 && (
                                <div
                                  className="mb-3"
                                >
                                  <div
                                    className="d-flex justify-content-between text-muted small mb-1"
                                  >
                                    <span>
                                      Progress
                                    </span>
                                    <span>
                                      {team.project.completedTasks}/{team.project.totalTasks} tasks ({team.project.progress}%)
                                    </span>
                                  </div>

                                  <div
                                    className="progress"
                                    style={{ height: "6px" }}
                                  >
                                    <div
                                      className="progress-bar bg-success"
                                      role="progressbar"
                                      style={{ width: `${team.project.progress}%` }}
                                      aria-valuenow={team.project.progress}
                                      aria-valuemin="0"
                                      aria-valuemax="100"
                                    >
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div
                                className="d-flex justify-content-between align-items-center pt-2 border-top"
                              >
                                <div
                                  className="d-flex flex-wrap gap-1"
                                >
                                  {(team.project.techStack || []).slice(0, 3).map((t, tIdx) => (
                                    <SkillBadge
                                      key={tIdx}
                                      name={t}
                                    />
                                  ))}
                                </div>

                                <Link
                                  to={`/projects/${team.project._id}`}
                                  className="btn btn-primary-custom btn-sm fw-semibold"
                                >
                                  Open Workspace →
                                </Link>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="p-4 rounded border bg-light text-center"
                            >
                              <p
                                className="text-muted small mb-3"
                              >
                                No project workspace created for this team yet.
                              </p>

                              <button
                                onClick={() => handleOpenCreateProject(team)}
                                className="btn btn-primary-custom btn-sm fw-semibold"
                              >
                                + Create Project with Teammates
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Skill Gap Component */}
                        <SkillGapCard
                          skillGap={team.skillGap}
                          teamId={team._id}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="card border shadow-sm rounded-3 p-5 bg-white text-center"
            >
              <h5
                className="fw-bold text-dark mb-2"
              >
                No Registered Hackathons Yet
              </h5>

              <p
                className="text-muted mb-4 mx-auto small"
                style={{ maxWidth: "480px" }}
              >
                Browse verified campus hackathons, form a squad with your peers, and coordinate your project development here.
              </p>

              <Link
                to="/hackathons"
                className="btn btn-primary-custom align-self-center px-4 fw-semibold"
              >
                Explore Hackathons & Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Create Team Project Modal */}
      <Modal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        title={`Create Project for ${selectedTeam?.name || "Team"}`}
      >
        <form
          onSubmit={handleCreateProjectSubmit}
        >
          <div
            className="mb-3"
          >
            <label
              className="form-label fw-semibold small"
            >
              Project Title *
            </label>

            <input
              type="text"
              className="form-control"
              placeholder="e.g. AI Attendance Assistant"
              value={projectForm.title}
              onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
              required
            />
          </div>

          <div
            className="mb-3"
          >
            <label
              className="form-label fw-semibold small"
            >
              Description & Objective *
            </label>

            <textarea
              className="form-control"
              rows="3"
              placeholder="What are you and your teammates building for this hackathon?"
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              required
            >
            </textarea>
          </div>

          <div
            className="mb-3"
          >
            <label
              className="form-label fw-semibold small"
            >
              Technology Stack (comma separated)
            </label>

            <input
              type="text"
              className="form-control"
              placeholder="React, Node.js, MongoDB, Python"
              value={projectForm.techStack}
              onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
            />
          </div>

          <div
            className="row g-3 mb-4"
          >
            <div
              className="col-md-6"
            >
              <label
                className="form-label fw-semibold small"
              >
                GitHub Repository URL
              </label>

              <input
                type="url"
                className="form-control"
                placeholder="https://github.com/..."
                value={projectForm.githubUrl}
                onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
              />
            </div>

            <div
              className="col-md-6"
            >
              <label
                className="form-label fw-semibold small"
              >
                Live Demo URL
              </label>

              <input
                type="url"
                className="form-control"
                placeholder="https://..."
                value={projectForm.liveUrl}
                onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
              />
            </div>
          </div>

          <div
            className="d-flex justify-content-end gap-2"
          >
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowProjectModal(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creatingProject}
              className="btn btn-primary-custom fw-semibold"
            >
              {creatingProject ? "Creating..." : "Launch Project Workspace"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Dashboard;
