import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import LoadingState from "../components/LoadingState";
import SkillGapCard from "../components/SkillGapCard";
import TeammateCard from "../components/TeammateCard";
import Modal from "../components/Modal";
import SkillBadge from "../components/SkillBadge";
import { useAuth } from "../context/AuthContext";

function TeamDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [error, setError] = useState("");

  // Invite modal state
  const [invitingUser, setInvitingUser] = useState(null);
  const [inviteMessage, setInviteMessage] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  // Create Project modal state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    techStack: "",
    githubUrl: "",
    liveUrl: ""
  });
  const [creatingProject, setCreatingProject] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");

  const { user: authUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/teams/${id}`);
      setData(res.data);

      if (res.data.team) {
        setProjectForm((prev) => ({
          ...prev,
          title: `${res.data.team.name} Project`,
          techStack: (res.data.team.requiredSkills || []).join(", ")
        }));
      }
    } catch (err) {
      console.error("Team details error:", err);
      setError("Failed to load team workspace.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setLoadingRecs(true);
      const res = await API.get(`/teams/${id}/recommendations`);
      setRecommendations(res.data);
    } catch (err) {
      console.error("Recommendations error:", err);
    } finally {
      setLoadingRecs(false);
    }
  };

  useEffect(() => {
    fetchTeamDetails();
    fetchRecommendations();
  }, [id]);

  const isTeamAdmin = data?.team && authUser && String(data.team.createdBy?._id || data.team.createdBy) === authUser._id;

  const handleOpenInviteModal = (student) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setInvitingUser(student);
    setInviteMessage(`Hi ${student.name}, we would love for you to join ${data.team.name} for the ${data.team.hackathonName}!`);
  };

  const handleSendInviteSubmit = async (e) => {
    e.preventDefault();
    if (!invitingUser) return;

    try {
      setSendingInvite(true);
      await API.post(`/teams/${id}/invite`, {
        userId: invitingUser._id,
        message: inviteMessage
      });
      setSuccessMsg(`Invitation sent to ${invitingUser.name}.`);
      setInvitingUser(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Send invite error:", err);
      alert(err.response?.data?.message || "Failed to send invitation.");
    } finally {
      setSendingInvite(false);
    }
  };

  const handleProcessJoinRequest = async (requestId, action) => {
    try {
      await API.put(`/teams/${id}/requests/${requestId}`, { action });
      setSuccessMsg(`Join request ${action === "accepted" ? "approved" : "declined"}.`);
      fetchTeamDetails();
      fetchRecommendations();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Process request error:", err);
      alert(err.response?.data?.message || "Could not process request.");
    }
  };

  const handleRemoveMember = async (userId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from the team?`)) return;
    try {
      await API.delete(`/teams/${id}/members/${userId}`);
      setSuccessMsg(`Removed ${memberName} from team.`);
      fetchTeamDetails();
      fetchRecommendations();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Remove member error:", err);
      alert(err.response?.data?.message || "Could not remove member.");
    }
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
        teamId: id,
        hackathonId: data.team?.hackathon?._id || null,
        techStack: techArr,
        githubUrl: projectForm.githubUrl,
        liveUrl: projectForm.liveUrl,
        status: "Planning"
      });

      setShowProjectModal(false);
      setSuccessMsg("Hackathon Project Workspace created.");
      fetchTeamDetails();
      navigate(`/projects/${res.data.project?._id}`);
    } catch (err) {
      console.error("Create project error:", err);
      alert(err.response?.data?.message || "Failed to create project.");
    } finally {
      setCreatingProject(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading team workspace..." />;
  }

  if (error || !data?.team) {
    return (
      <div
        className="container py-5 text-center"
      >
        <div
          className="alert alert-danger"
        >
          {error || "Team not found."}
        </div>

        <Link
          to="/teams"
          className="btn btn-primary-custom"
        >
          Back to Teams
        </Link>
      </div>
    );
  }

  const { team, skillGap, project, joinRequests } = data;

  return (
    <div
      className="team-details-page py-4"
    >
      <div
        className="container"
      >
        {/* Team Banner */}
        <div
          className="card border shadow-sm rounded-3 p-4 bg-white mb-4"
        >
          <div
            className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2"
          >
            <div>
              <span
                className="badge bg-primary-subtle text-primary border small mb-1"
              >
                {team.hackathonName || team.hackathon?.name || "Hackathon"}
              </span>

              <h2
                className="fw-bold text-primary mb-1"
              >
                {team.name}
              </h2>

              <p
                className="text-muted small mb-0"
              >
                Admin: <strong>{team.createdBy?.name}</strong> • {team.members?.length}/{team.maxMembers} Members
              </p>
            </div>

            <div
              className="d-flex gap-2"
            >
              {isTeamAdmin && !project && (
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="btn btn-primary-custom btn-sm fw-semibold shadow-sm"
                >
                  Create Hackathon Project
                </button>
              )}

              {project && (
                <Link
                  to={`/projects/${project._id}`}
                  className="btn btn-success btn-sm fw-semibold shadow-sm"
                >
                  Open Project Workspace
                </Link>
              )}
            </div>
          </div>

          {team.description && (
            <p
              className="text-secondary small mt-2 mb-0"
            >
              {team.description}
            </p>
          )}
        </div>

        {successMsg && (
          <div
            className="alert alert-success py-2 alert-dismissible fade show"
            role="alert"
          >
            {successMsg}
          </div>
        )}

        {/* Skill Gap Analysis Section */}
        <SkillGapCard
          skillGap={skillGap}
          teamId={id}
        />

        {/* Join Requests (Admin Only) */}
        {isTeamAdmin && joinRequests && joinRequests.length > 0 && (
          <div
            className="card border shadow-sm rounded-3 p-4 bg-white mb-4 border-start border-warning border-4"
          >
            <h6
              className="fw-bold text-dark mb-3 fs-5"
            >
              Pending Join Requests ({joinRequests.length})
            </h6>

            <div
              className="d-flex flex-column gap-2"
            >
              {joinRequests.map((req) => (
                <div
                  key={req._id}
                  className="p-3 bg-light rounded border d-flex justify-content-between align-items-center flex-wrap gap-2"
                >
                  <div>
                    <h6
                      className="fw-bold text-primary mb-1"
                    >
                      {req.user?.name} ({req.user?.primaryRole})
                    </h6>

                    <p
                      className="small text-muted mb-1"
                    >
                      "{req.message}"
                    </p>

                    <div
                      className="d-flex flex-wrap gap-1"
                    >
                      {(req.user?.skills || []).map((s, idx) => (
                        <span
                          key={idx}
                          className="badge bg-white text-dark border small"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    className="d-flex gap-1"
                  >
                    <button
                      onClick={() => handleProcessJoinRequest(req._id, "accepted")}
                      className="btn btn-success btn-sm fw-semibold"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => handleProcessJoinRequest(req._id, "rejected")}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Members Grid */}
        <div
          className="card border shadow-sm rounded-3 p-4 bg-white mb-4"
        >
          <div
            className="d-flex justify-content-between align-items-center mb-3"
          >
            <h6
              className="fw-bold text-primary mb-0 fs-5"
            >
              Team Members ({team.members?.length || 0}/{team.maxMembers || 4})
            </h6>

            {team.hackathon?.officialUrl && (
              <a
                href={team.hackathon.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-success btn-sm"
              >
                Official Hackathon Page ↗
              </a>
            )}
          </div>

          <div
            className="row g-3"
          >
            {team.members?.map((m, idx) => (
              <div
                key={idx}
                className="col-md-6 col-lg-3"
              >
                <div
                  className="card border h-100 p-3 bg-light rounded-3 d-flex flex-column text-center"
                >
                  <div
                    className="avatar-circle mx-auto mb-2"
                  >
                    {m.user?.name ? m.user.name.charAt(0).toUpperCase() : "M"}
                  </div>

                  <h6
                    className="fw-bold text-primary mb-1"
                  >
                    <Link
                      to={`/profile/${m.user?._id}`}
                      className="text-decoration-none text-primary"
                    >
                      {m.user?.name || "Student"}
                    </Link>
                  </h6>

                  <span
                    className="badge bg-white text-secondary border small mb-2 align-self-center"
                  >
                    {m.role || "Developer"}
                  </span>

                  <div
                    className="d-flex flex-wrap justify-content-center gap-1 mb-2"
                  >
                    {(m.user?.skills || []).slice(0, 3).map((s, sIdx) => (
                      <span
                        key={sIdx}
                        className="badge bg-primary-subtle text-primary border"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {isTeamAdmin && String(m.user?._id) !== authUser?._id && (
                    <div
                      className="mt-auto pt-2 border-top"
                    >
                      <button
                        onClick={() => handleRemoveMember(m.user?._id, m.user?.name)}
                        className="btn btn-outline-danger btn-sm py-0"
                        style={{ fontSize: "0.75rem" }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Linked Project Workspace Card if exists */}
        {project && (
          <div
            className="card border shadow-sm rounded-3 p-4 bg-white mb-4"
          >
            <div
              className="d-flex justify-content-between align-items-center mb-2"
            >
              <h6
                className="fw-bold text-primary mb-0 fs-5"
              >
                Linked Project: {project.title}
              </h6>

              <Link
                to={`/projects/${project._id}`}
                className="btn btn-outline-primary btn-sm fw-semibold"
              >
                Open Project Workspace →
              </Link>
            </div>

            <p
              className="text-secondary small mb-3"
            >
              {project.description}
            </p>

            <div
              className="d-flex gap-2 flex-wrap align-items-center"
            >
              <span
                className="badge bg-success"
              >
                Status: {project.status}
              </span>

              <span
                className="text-muted small"
              >
                Tasks: {project.tasks?.length || 0} features tracked
              </span>

              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-outline-dark py-0"
                >
                  GitHub ↗
                </a>
              )}
            </div>
          </div>
        )}

        {/* Complementary Teammate Recommendations */}
        <div
          id="recommendations"
          className="card border shadow-sm rounded-3 p-4 bg-white"
        >
          <div
            className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2"
          >
            <div>
              <h5
                className="fw-bold text-primary mb-1 fs-5"
              >
                Complementary Teammate Recommendations
              </h5>

              <p
                className="text-muted small mb-0"
              >
                Rule-based matching based on skills your team is currently missing.
              </p>
            </div>

            <button
              onClick={fetchRecommendations}
              className="btn btn-outline-secondary btn-sm"
            >
              Refresh Recommendations
            </button>
          </div>

          {loadingRecs ? (
            <LoadingState message="Analyzing skill gaps and calculating complementary fit scores..." />
          ) : recommendations.length > 0 ? (
            <div
              className="row g-4"
            >
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="col-md-6 col-lg-4"
                >
                  <TeammateCard
                    student={rec.student}
                    fitScore={rec.fitScore}
                    matchedSkills={rec.matchedSkills}
                    reason={rec.reason}
                    onInvite={handleOpenInviteModal}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-4 text-muted small"
            >
              Your team has covered all required skills or all matching candidates are already in the team.
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={!!invitingUser}
        onClose={() => setInvitingUser(null)}
        title={`Invite ${invitingUser?.name} to Team`}
      >
        <form
          onSubmit={handleSendInviteSubmit}
        >
          <div
            className="mb-3"
          >
            <p
              className="text-muted small"
            >
              Inviting <strong>{invitingUser?.name}</strong> ({invitingUser?.primaryRole}) to join <strong>{team.name}</strong>.
            </p>

            <label
              className="form-label fw-semibold small"
            >
              Invitation Message
            </label>

            <textarea
              className="form-control"
              rows="3"
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              required
            >
            </textarea>
          </div>

          <div
            className="d-flex justify-content-end gap-2"
          >
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setInvitingUser(null)}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={sendingInvite}
              className="btn btn-primary-custom fw-semibold"
            >
              {sendingInvite ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Project Modal */}
      <Modal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        title="Create Team Hackathon Project"
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
              placeholder="e.g. Smart Campus Assistant"
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
              Problem Statement & Description *
            </label>

            <textarea
              className="form-control"
              rows="3"
              placeholder="What problem does this project solve during the hackathon?"
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
              {creatingProject ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default TeamDetails;
