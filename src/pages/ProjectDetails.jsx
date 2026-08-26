import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import LoadingState from "../components/LoadingState";
import Modal from "../components/Modal";
import SkillBadge from "../components/SkillBadge";
import { useAuth } from "../context/AuthContext";

function ProjectDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Task creation modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "Medium"
  });
  const [savingTask, setSavingTask] = useState(false);

  // Collaboration request modal state
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [collabForm, setCollabForm] = useState({
    role: "Contributor",
    message: "Hi, I'd like to collaborate and contribute to this project!"
  });
  const [sendingCollab, setSendingCollab] = useState(false);

  // Project status update
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const { user: authUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/projects/${id}`);
      setData(res.data);
    } catch (err) {
      console.error("Project details error:", err);
      setError("Failed to load project workspace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const isOwner = data?.project && authUser && String(data.project.createdBy?._id || data.project.createdBy) === authUser._id;

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusUpdating(true);
      await API.put(`/projects/${id}`, { status: newStatus });
      setSuccessMsg(`Project status changed to '${newStatus}'.`);
      fetchProjectDetails();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Status update error:", err);
      alert(err.response?.data?.message || "Failed to update project status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAddTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    try {
      setSavingTask(true);
      await API.post(`/projects/${id}/tasks`, taskForm);
      setSuccessMsg("Task added successfully.");
      setShowTaskModal(false);
      setTaskForm({ title: "", description: "", priority: "Medium" });
      fetchProjectDetails();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Add task error:", err);
      alert(err.response?.data?.message || "Failed to add task.");
    } finally {
      setSavingTask(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await API.put(`/projects/${id}/tasks/${taskId}`, { status: newStatus });
      fetchProjectDetails();
    } catch (err) {
      console.error("Task status error:", err);
      alert(err.response?.data?.message || "Failed to update task status.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await API.delete(`/projects/${id}/tasks/${taskId}`);
      setSuccessMsg("Task deleted.");
      fetchProjectDetails();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Delete task error:", err);
      alert(err.response?.data?.message || "Failed to delete task.");
    }
  };

  const handleSendCollaborationRequest = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      setSendingCollab(true);
      await API.post(`/projects/${id}/collaborate`, collabForm);
      setSuccessMsg("Collaboration request sent to project lead.");
      setShowCollabModal(false);
      fetchProjectDetails();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Collaborate error:", err);
      alert(err.response?.data?.message || "Failed to send request.");
    } finally {
      setSendingCollab(false);
    }
  };

  const handleRespondCollab = async (requestId, action) => {
    try {
      await API.put(`/projects/${id}/requests/${requestId}`, { action });
      setSuccessMsg(`Collaboration request ${action === "accepted" ? "approved" : "declined"}.`);
      fetchProjectDetails();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Collab response error:", err);
      alert(err.response?.data?.message || "Failed to process request.");
    }
  };

  if (loading) {
    return <LoadingState message="Loading project workspace..." />;
  }

  if (error || !data?.project) {
    return (
      <div
        className="container py-5 text-center"
      >
        <div
          className="alert alert-danger"
        >
          {error || "Project not found."}
        </div>

        <Link
          to="/projects"
          className="btn btn-primary-custom"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  const { project, progress, totalTasks, completedTasks } = data;

  return (
    <div
      className="project-details-page py-4"
    >
      <div
        className="container"
      >
        {/* Banner */}
        <div
          className="card border shadow-sm rounded-3 p-4 bg-white mb-4"
        >
          <div
            className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2"
          >
            <div>
              <div
                className="d-flex gap-2 align-items-center mb-1"
              >
                <span
                  className="badge bg-primary px-3 py-1 fs-6"
                >
                  {project.status}
                </span>

                {project.team && (
                  <Link
                    to={`/teams/${project.team._id}`}
                    className="badge bg-light text-dark border text-decoration-none"
                  >
                    Team: {project.team.name}
                  </Link>
                )}

                {project.hackathon && (
                  <Link
                    to={`/hackathons/${project.hackathon._id}`}
                    className="badge bg-success-subtle text-success border text-decoration-none"
                  >
                    Hackathon: {project.hackathon.name}
                  </Link>
                )}
              </div>

              <h2
                className="fw-bold text-primary mb-1"
              >
                {project.title}
              </h2>

              <p
                className="text-muted small mb-0"
              >
                Created by <strong>{project.createdBy?.name}</strong> ({project.createdBy?.primaryRole})
              </p>
            </div>

            <div
              className="d-flex gap-2 flex-wrap"
            >
              {isOwner ? (
                <div
                  className="d-flex gap-2 align-items-center"
                >
                  <label
                    className="small text-muted fw-semibold"
                  >
                    Status:
                  </label>

                  <select
                    className="form-select form-select-sm"
                    style={{ width: "140px" }}
                    value={project.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={statusUpdating}
                  >
                    <option
                      value="Planning"
                    >
                      Planning
                    </option>

                    <option
                      value="In Progress"
                    >
                      In Progress
                    </option>

                    <option
                      value="Testing"
                    >
                      Testing
                    </option>

                    <option
                      value="Completed"
                    >
                      Completed
                    </option>
                  </select>
                </div>
              ) : (
                <button
                  onClick={() => setShowCollabModal(true)}
                  className="btn btn-primary-custom btn-sm fw-semibold"
                >
                  Request to Collaborate
                </button>
              )}
            </div>
          </div>

          <p
            className="text-secondary mt-3 mb-3 leading-relaxed"
          >
            {project.description}
          </p>

          {/* Tech Stack & External Links */}
          <div
            className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-3 border-top"
          >
            <div
              className="d-flex flex-wrap gap-1 align-items-center"
            >
              <span
                className="fw-semibold text-dark small me-1"
              >
                Tech Stack:
              </span>

              {(project.techStack || []).map((t, idx) => (
                <SkillBadge
                  key={idx}
                  name={t}
                />
              ))}
            </div>

            <div
              className="d-flex gap-2"
            >
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-dark btn-sm"
                >
                  GitHub Repository ↗
                </a>
              )}

              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-success btn-sm"
                >
                  Live Demo ↗
                </a>
              )}
            </div>
          </div>
        </div>

        {successMsg && (
          <div
            className="alert alert-success py-2 alert-dismissible fade show"
            role="alert"
          >
            {successMsg}
          </div>
        )}

        {/* Feature / Task Tracker Board */}
        <div
          className="card border shadow-sm rounded-3 p-4 bg-white mb-4"
        >
          <div
            className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2"
          >
            <div>
              <h5
                className="fw-bold text-primary mb-1 fs-5"
              >
                Project Feature & Task Tracker
              </h5>

              <p
                className="text-muted small mb-0"
              >
                Track implementation progress ({completedTasks}/{totalTasks} features completed - {progress}%)
              </p>
            </div>

            <button
              onClick={() => setShowTaskModal(true)}
              className="btn btn-primary-custom btn-sm fw-semibold"
            >
              Add Feature / Task
            </button>
          </div>

          <div
            className="progress mb-4"
            style={{ height: "8px" }}
          >
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{ width: `${progress}%` }}
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
            >
            </div>
          </div>

          {/* 3 Status Columns: Todo, In Progress, Completed */}
          <div
            className="row g-3"
          >
            {["Todo", "In Progress", "Completed"].map((colStatus) => {
              const columnTasks = (project.tasks || []).filter((t) => t.status === colStatus);
              return (
                <div
                  key={colStatus}
                  className="col-md-4"
                >
                  <div
                    className="p-3 bg-light rounded-3 border h-100"
                  >
                    <div
                      className="d-flex justify-content-between align-items-center mb-3"
                    >
                      <h6
                        className="fw-bold text-dark mb-0"
                      >
                        {colStatus} ({columnTasks.length})
                      </h6>
                    </div>

                    <div
                      className="d-flex flex-column gap-2"
                    >
                      {columnTasks.length > 0 ? (
                        columnTasks.map((task) => (
                          <div
                            key={task._id}
                            className="p-3 bg-white rounded border shadow-sm"
                          >
                            <div
                              className="d-flex justify-content-between align-items-start mb-1"
                            >
                              <h6
                                className="fw-bold text-dark mb-0 small"
                              >
                                {task.title}
                              </h6>

                              <span
                                className={`badge small ${
                                  task.priority === "High"
                                    ? "bg-danger"
                                    : task.priority === "Medium"
                                    ? "bg-warning text-dark"
                                    : "bg-secondary"
                                }`}
                                style={{ fontSize: "0.7rem" }}
                              >
                                {task.priority}
                              </span>
                            </div>

                            {task.description && (
                              <p
                                className="text-muted small mb-2"
                                style={{ fontSize: "0.82rem" }}
                              >
                                {task.description}
                              </p>
                            )}

                            <div
                              className="d-flex justify-content-between align-items-center pt-2 border-top"
                            >
                              <select
                                className="form-select form-select-sm py-0"
                                style={{ fontSize: "0.75rem", width: "120px" }}
                                value={task.status}
                                onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                              >
                                <option
                                  value="Todo"
                                >
                                  Todo
                                </option>

                                <option
                                  value="In Progress"
                                >
                                  In Progress
                                </option>

                                <option
                                  value="Completed"
                                >
                                  Completed
                                </option>
                              </select>

                              {isOwner && (
                                <button
                                  onClick={() => handleDeleteTask(task._id)}
                                  className="btn btn-link text-danger p-0 text-decoration-none"
                                  style={{ fontSize: "0.8rem" }}
                                  title="Delete Task"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div
                          className="text-center py-4 text-muted small"
                        >
                          No {colStatus} tasks
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Collaboration Requests (Owner View) */}
        {isOwner && project.collaborationRequests && project.collaborationRequests.length > 0 && (
          <div
            className="card border shadow-sm rounded-3 p-4 bg-white mb-4"
          >
            <h5
              className="fw-bold text-primary mb-3 fs-5"
            >
              Collaboration Requests ({project.collaborationRequests.length})
            </h5>

            <div
              className="d-flex flex-column gap-2"
            >
              {project.collaborationRequests.map((req) => (
                <div
                  key={req._id}
                  className="p-3 bg-light rounded border d-flex justify-content-between align-items-center flex-wrap gap-2"
                >
                  <div>
                    <h6
                      className="fw-bold mb-0"
                    >
                      {req.user?.name} ({req.role})
                    </h6>

                    <p
                      className="small text-muted mb-0"
                    >
                      "{req.message}"
                    </p>
                  </div>

                  <div
                    className="d-flex gap-2 align-items-center"
                  >
                    <span
                      className={`badge ${req.status === "accepted" ? "bg-success" : req.status === "rejected" ? "bg-danger" : "bg-warning text-dark"}`}
                    >
                      {req.status}
                    </span>

                    {req.status === "pending" && (
                      <div
                        className="d-flex gap-1"
                      >
                        <button
                          onClick={() => handleRespondCollab(req._id, "accepted")}
                          className="btn btn-success btn-sm fw-semibold"
                        >
                          Accept
                        </button>

                        <button
                          onClick={() => handleRespondCollab(req._id, "rejected")}
                          className="btn btn-outline-secondary btn-sm"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title="Add Feature / Task"
      >
        <form
          onSubmit={handleAddTaskSubmit}
        >
          <div
            className="mb-3"
          >
            <label
              className="form-label fw-semibold small"
            >
              Feature / Task Title *
            </label>

            <input
              type="text"
              className="form-control"
              placeholder="e.g. Build User Authentication, Train Model..."
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              required
            />
          </div>

          <div
            className="mb-3"
          >
            <label
              className="form-label fw-semibold small"
            >
              Description
            </label>

            <textarea
              className="form-control"
              rows="3"
              placeholder="Details on what needs to be implemented..."
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            >
            </textarea>
          </div>

          <div
            className="mb-4"
          >
            <label
              className="form-label fw-semibold small"
            >
              Priority
            </label>

            <select
              className="form-select"
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
            >
              <option
                value="Low"
              >
                Low
              </option>

              <option
                value="Medium"
              >
                Medium
              </option>

              <option
                value="High"
              >
                High
              </option>
            </select>
          </div>

          <div
            className="d-flex justify-content-end gap-2"
          >
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowTaskModal(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={savingTask}
              className="btn btn-primary-custom fw-semibold"
            >
              {savingTask ? "Saving..." : "Add Task"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Collaborate Modal */}
      <Modal
        isOpen={showCollabModal}
        onClose={() => setShowCollabModal(false)}
        title="Request to Collaborate on Project"
      >
        <form
          onSubmit={handleSendCollaborationRequest}
        >
          <div
            className="mb-3"
          >
            <label
              className="form-label fw-semibold small"
            >
              Your Proposed Role
            </label>

            <input
              type="text"
              className="form-control"
              value={collabForm.role}
              onChange={(e) => setCollabForm({ ...collabForm, role: e.target.value })}
              required
            />
          </div>

          <div
            className="mb-4"
          >
            <label
              className="form-label fw-semibold small"
            >
              Message to Project Lead
            </label>

            <textarea
              className="form-control"
              rows="3"
              value={collabForm.message}
              onChange={(e) => setCollabForm({ ...collabForm, message: e.target.value })}
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
              onClick={() => setShowCollabModal(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={sendingCollab}
              className="btn btn-primary-custom fw-semibold"
            >
              {sendingCollab ? "Sending..." : "Submit Request"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ProjectDetails;
