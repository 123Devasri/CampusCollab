import React from "react";
import { Link } from "react-router-dom";
import SkillBadge from "./SkillBadge";

function TeammateCard({ student, fitScore, matchedSkills, reason, onInvite, isInviting }) {
  if (!student) return null;

  return (
    <div
      className="card h-100 border shadow-sm rounded-3 custom-card card-hover-lift"
    >
      <div
        className="card-body p-4 d-flex flex-column"
      >
        <div
          className="d-flex justify-content-between align-items-start mb-3"
        >
          <div
            className="d-flex align-items-center gap-3"
          >
            <div
              className="avatar-circle"
            >
              {student.name ? student.name.charAt(0).toUpperCase() : "S"}
            </div>

            <div>
              <h5
                className="card-title fw-bold text-primary mb-1 fs-5"
              >
                {student.name}
              </h5>

              <p
                className="text-muted small mb-0"
              >
                {student.primaryRole || "Student Developer"}
              </p>
            </div>
          </div>

          {fitScore && (
            <span
              className="badge bg-success-subtle text-success border border-success fw-semibold"
            >
              {fitScore}% Match
            </span>
          )}
        </div>

        <p
          className="text-muted small mb-2"
        >
          {student.college || "University"} • {student.year || "Student"}
        </p>

        {student.bio && (
          <p
            className="small text-secondary mb-3 text-truncate-2"
            style={{ minHeight: "38px" }}
          >
            {student.bio}
          </p>
        )}

        {reason && (
          <div
            className="alert alert-info py-2 px-3 small mb-3 border bg-info-subtle text-info-emphasis"
          >
            <strong>Match Reason:</strong> {reason}
          </div>
        )}

        <div
          className="mb-3 flex-grow-1"
        >
          <p
            className="fw-semibold text-dark small mb-1"
          >
            Skills:
          </p>

          <div
            className="d-flex flex-wrap gap-1"
          >
            {student.skills && student.skills.length > 0 ? (
              student.skills.map((skill, idx) => (
                <SkillBadge
                  key={idx}
                  name={skill}
                  variant={matchedSkills && matchedSkills.includes(skill) ? "success" : "default"}
                />
              ))
            ) : (
              <span
                className="text-muted small"
              >
                No skills listed
              </span>
            )}
          </div>
        </div>

        {/* Contact Info (Gmail / Email & GitHub) */}
        <div
          className="mb-3 pt-2 border-top d-flex flex-column gap-1"
        >
          {student.email && (
            <div
              className="small"
            >
              <span
                className="text-muted fw-semibold me-1"
              >
                Contact:
              </span>

              <a
                href={`mailto:${student.email}`}
                className="text-primary text-decoration-none fw-semibold"
                title="Send email"
              >
                {student.email}
              </a>
            </div>
          )}

          {student.githubUsername && (
            <div
              className="small"
            >
              <span
                className="text-muted fw-semibold me-1"
              >
                GitHub:
              </span>

              <a
                href={`https://github.com/${student.githubUsername}`}
                target="_blank"
                rel="noreferrer"
                className="text-dark text-decoration-none fw-semibold"
              >
                github.com/{student.githubUsername} ↗
              </a>
            </div>
          )}
        </div>

        <div
          className="mt-auto pt-3 border-top d-flex gap-2"
        >
          <Link
            to={`/profile/${student._id}`}
            className="btn btn-outline-custom btn-sm flex-fill text-center"
          >
            View Profile
          </Link>

          {onInvite && (
            <button
              onClick={() => onInvite(student)}
              disabled={isInviting}
              className="btn btn-primary-custom btn-sm flex-fill"
            >
              {isInviting ? "Inviting..." : "+ Add to Team"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeammateCard;
