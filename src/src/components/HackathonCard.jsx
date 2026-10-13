import React from "react";
import { Link } from "react-router-dom";

function HackathonCard({ hackathon, onCreateTeam }) {
  if (!hackathon) return null;

  const getModeBadge = (mode) => {
    switch (mode) {
      case "Online":
        return "bg-success text-white";
      case "Offline":
        return "bg-secondary text-white";
      case "Hybrid":
        return "bg-info text-dark";
      default:
        return "bg-primary text-white";
    }
  };

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
            className={`badge px-2 py-1 ${getModeBadge(hackathon.mode)}`}
          >
            {hackathon.mode || "Online"}
          </span>

          <span
            className="text-muted small fw-semibold"
          >
            Deadline: {hackathon.registrationDeadline}
          </span>
        </div>

        <h5
          className="card-title fw-bold text-primary mb-1 fs-5"
        >
          {hackathon.name}
        </h5>

        <p
          className="text-muted small mb-2"
        >
          Organized by: <strong>{hackathon.organizer}</strong>
        </p>

        <p
          className="text-secondary small mb-3 text-truncate-3"
          style={{ minHeight: "44px" }}
        >
          {hackathon.description}
        </p>

        <div
          className="mb-3 text-muted small"
        >
          <div
            className="mb-1"
          >
            <strong>Location:</strong> {hackathon.location || "Virtual / Campus"}
          </div>

          <div
            className="mb-1"
          >
            <strong>Themes:</strong> {hackathon.technology || "General Technology"}
          </div>

          {hackathon.prizePool && (
            <div
              className="text-success fw-semibold"
            >
              <strong>Prizes:</strong> {hackathon.prizePool}
            </div>
          )}
        </div>

        <div
          className="mt-auto pt-3 border-top d-flex gap-2"
        >
          <Link
            to={`/hackathons/${hackathon._id}`}
            className="btn btn-outline-custom btn-sm flex-fill text-center"
          >
            View Details
          </Link>

          {onCreateTeam ? (
            <button
              onClick={() => onCreateTeam(hackathon)}
              className="btn btn-primary-custom btn-sm flex-fill"
            >
              Create Team
            </button>
          ) : (
            <Link
              to={`/hackathons/${hackathon._id}?createTeam=true`}
              className="btn btn-primary-custom btn-sm flex-fill text-center"
            >
              Create Team
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default HackathonCard;
