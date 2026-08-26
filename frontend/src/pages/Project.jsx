import React, { useEffect, useState } from "react";
import API from "../services/api";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import ProjectCard from "../components/ProjectCard";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Project() {
  const [projects, setProjects] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Create Project modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    teamId: "",
    role: "Lead Developer",
    techStack: "React, Node.js, MongoDB",
    githubUrl: "",
    liveUrl: "",
    status: "Planning"
  });
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await API.get("/projects", {
        params: {
          search: search.trim() || undefined,
          status: statusFilter !== "All" ? statusFilter : undefined
        }
      });
      setProjects(res.data);
    } catch (err) {
      console.error("Projects load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTeams = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await API.get("/teams/my");
      setMyTeams(res.data || []);
    } catch (err) {
      console.error("Fetch teams error:", err);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchProjects();
    }, 250);
    return () => clearTimeout(delaySearch);
  }, [search, statusFilter]);

  useEffect(() => {
    fetchMyTeams();
  }, [isAuthenticated]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const handleOpenAddProject = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setShowModal(true);
  };

  const handleTeamSelect = (selectedTeamId) => {
    const selected = myTeams.find((t) => t._id === selectedTeamId);
    if (selected) {
      setForm({
        ...form,
        teamId: selected._id,
        title: `${selected.name} Project`,
        description: `Collaborative project for ${selected.hackathonName || selected.hackathon?.name || "Hackathon"}`,
        techStack: (selected.requiredSkills || []).join(", ")
      });
    } else {
      setForm({
        ...form,
        teamId: ""
      });
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;

    const techArr = form.techStack
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const selectedTeamObj = myTeams.find((t) => t._id === form.teamId);

    try {
      setCreating(true);
      await API.post("/projects", {
        ...form,
        techStack: techArr,
        teamId: form.teamId || null,
        hackathonId: selectedTeamObj?.hackathon?._id || selectedTeamObj?.hackathon || null
      });

      setShowModal(false);
      setSuccessMsg(`Project '${form.title}' created successfully.`);
      setForm({
        title: "",
        description: "",
        teamId: "",
        role: "Lead Developer",
        techStack: "React, Node.js, MongoDB",
        githubUrl: "",
        liveUrl: "",
        status: "Planning"
      });
      fetchProjects();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Create project error:", err);
      alert(err.response?.data?.message || "Failed to create project.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="projects-page py-4"
    >
      <div
        className="container"
      >
        {/* Header */}
        <div
          className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2"
        >
          <div>
            <h3
              className="fw-bold text-primary mb-1"
            >
              Project Workspaces
            </h3>

            <p
              className="text-muted mb-0 small"
            >
              Collaborate on hackathon projects with your squad, track feature progress, and build together.
            </p>
          </div>

          <button
            onClick={handleOpenAddProject}
            className="btn btn-primary-custom fw-semibold shadow-sm"
          >
            + Add Project to Work On
          </button>
        </div>

        {successMsg && (
          <div
            className="alert alert-success py-2 alert-dismissible fade show"
            role="alert"
          >
            {successMsg}
          </div>
        )}

        {/* Search & Status Filters */}
        <div
          className="card border shadow-sm rounded-3 p-3 bg-white mb-4"
        >
          <form
            onSubmit={handleSearchSubmit}
            className="row g-2 align-items-center"
          >
            <div
              className="col-md-7"
            >
              <input
                type="text"
                className="form-control"
                placeholder="Search projects by title, tech stack, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div
              className="col-md-3"
            >
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option
                  value="All"
                >
                  All Project Statuses
                </option>

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

            <div
              className="col-md-2"
            >
              <button
                type="submit"
                className="btn btn-primary-custom w-100 btn-sm fw-semibold"
              >
                Filter
              </button>
            </div>
          </form>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <LoadingState message="Loading projects..." />
        ) : projects.length > 0 ? (
          <div
            className="row g-4"
          >
            {projects.map((project) => (
              <div
                key={project._id}
                className="col-md-6 col-lg-4"
              >
                <ProjectCard
                  project={project}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Projects Found"
            message="No projects match your current filter. Create a new project to start building with your team!"
            actionText="Add Project to Work On"
            onActionClick={handleOpenAddProject}
          />
        )}
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Project to Work On"
      >
        <form
          onSubmit={handleCreateSubmit}
        >
          {/* Team / Hackathon selector */}
          {myTeams.length > 0 && (
            <div
              className="mb-3"
            >
              <label
                className="form-label fw-semibold small"
              >
                Work on this Project with Your Squad:
              </label>

              <select
                className="form-select"
                value={form.teamId}
                onChange={(e) => handleTeamSelect(e.target.value)}
              >
                <option
                  value=""
                >
                  Independent Project (No Team Linked)
                </option>

                {myTeams.map((t) => (
                  <option
                    key={t._id}
                    value={t._id}
                  >
                    {t.name} — ({t.hackathonName || t.hackathon?.name || "Hackathon"})
                  </option>
                ))}
              </select>

              <div
                className="form-text small"
              >
                Linking a team gives all your squad teammates access to this project workspace and task tracker.
              </div>
            </div>
          )}

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
              placeholder="e.g. Campus Attendance Tracker"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div
            className="mb-3"
          >
            <label
              className="form-label fw-semibold small"
            >
              Description & Objectives *
            </label>

            <textarea
              className="form-control"
              rows="3"
              placeholder="What are you and your teammates building? What features will be included?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            >
            </textarea>
          </div>

          <div
            className="row g-3 mb-3"
          >
            <div
              className="col-md-6"
            >
              <label
                className="form-label fw-semibold small"
              >
                Your Role
              </label>

              <input
                type="text"
                className="form-control"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
            </div>

            <div
              className="col-md-6"
            >
              <label
                className="form-label fw-semibold small"
              >
                Project Status
              </label>

              <select
                className="form-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
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
          </div>

          <div
            className="mb-3"
          >
            <label
              className="form-label fw-semibold small"
            >
              Technologies Used (comma separated)
            </label>

            <input
              type="text"
              className="form-control"
              placeholder="React, Node.js, MongoDB, Python"
              value={form.techStack}
              onChange={(e) => setForm({ ...form, techStack: e.target.value })}
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
                value={form.githubUrl}
                onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
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
                value={form.liveUrl}
                onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
              />
            </div>
          </div>

          <div
            className="d-flex justify-content-end gap-2"
          >
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creating}
              className="btn btn-primary-custom fw-semibold"
            >
              {creating ? "Launching..." : "Launch Project Workspace"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Project;