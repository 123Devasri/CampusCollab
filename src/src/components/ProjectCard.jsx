import React from "react";
import { Link } from "react-router-dom";
import SkillBadge from "./SkillBadge";

function ProjectCard({ project }) {
  if (!project) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return "bg-success text-white";
      case "In Progress":
        return "bg-primary text-white";
      case "Testing":
        return "bg-info text-dark";
      default:
        return "bg-warning text-dark";
    }
  };

  const completedTasks = (project.tasks || []).filter((t) => t.status === "Completed").length;
  const totalTasks = (project.tasks || []).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : project.status === "Completed" ? 100 : 0;

  return (
    <div
      className="card h-100 border shadow-sm rounded-3 custom-card card-hover-lift"
    >
      <div
        className="card-body p-4 d-flex flex-column"
      >
        <div
          className="d-flex justify-content-between align-items-start mb-2"
        >
          <span
            className={`badge px-2 py-1 ${getStatusBadge(project.status)}`}
          >
            {project.status || "Planning"}
          </span>

          {project.team && (
            <span
              className="badge bg-secondary-subtle text-secondary border small"
            >
              Team: {project.team.name || "Team Project"}
            </span>
          )}
        </div>

        <h5
          className="card-title fw-bold text-primary mb-1 fs-5"
        >
          {project.title}
        </h5>

        <p
          className="text-muted small mb-2"
        >
          By {project.createdBy?.name || "Student"} • {project.role || "Lead"}
        </p>

        <p
          className="text-secondary small mb-3 text-truncate-3"
          style={{ minHeight: "44px" }}
        >
          {project.description}
        </p>

        {totalTasks > 0 && (
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
                {completedTasks}/{totalTasks} tasks ({progressPercent}%)
              </span>
            </div>

            <div
              className="progress"
              style={{ height: "6px" }}
            >
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: `${progressPercent}%` }}
                aria-valuenow={progressPercent}
                aria-valuemin="0"
                aria-valuemax="100"
              >
              </div>
            </div>
          </div>
        )}

        <div
          className="mb-3 flex-grow-1"
        >
          <p
            className="fw-semibold text-dark small mb-1"
          >
            Tech Stack:
          </p>

          <div
            className="d-flex flex-wrap gap-1"
          >
            {project.techStack && project.techStack.length > 0 ? (
              project.techStack.map((tech, idx) => (
                <SkillBadge
                  key={idx}
                  name={tech}
                />
              ))
            ) : (
              <span
                className="text-muted small"
              >
                No technologies listed
              </span>
            )}
          </div>
        </div>

        {project.githubUrl && (
          <div
            className="mb-3"
          >
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="text-decoration-none small text-dark fw-semibold"
            >
              GitHub: {project.githubUrl.replace(/^https?:\/\/github\.com\//, "")} ↗
            </a>
          </div>
        )}

        <div
          className="mt-auto pt-3 border-top d-flex gap-2"
        >
          <Link
            to={`/projects/${project._id}`}
            className="btn btn-outline-custom btn-sm flex-fill text-center"
          >
            Open Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
