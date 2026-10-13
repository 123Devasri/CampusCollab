import React, { useState } from "react";
import { Link } from "react-router-dom";

function HackathonCard({ hackathon, onCreateTeam }) {
  if (!hackathon) return null;

  const [showHover, setShowHover] = useState(false);
  const registeredTeams = hackathon.registeredTeams || [];
  const registeredUsersCount = hackathon.registeredUsersCount || (hackathon.registeredUsers ? hackathon.registeredUsers.length : 0);

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

        {/* Registered Teams & Members Hover Trigger */}
        <div 
          className="position-relative mb-3 pt-2 border-top"
          onMouseEnter={() => setShowHover(true)}
          onMouseLeave={() => setShowHover(false)}
        >
          <div className="d-flex justify-content-between align-items-center p-2 rounded-2 bg-light border" style={{ cursor: "pointer" }}>
            <span className="small fw-semibold text-dark">
              Registered Teams:
            </span>
            <span className={`badge ${registeredTeams.length > 0 ? "bg-primary text-white" : "bg-secondary-subtle text-secondary"}`}>
              {registeredTeams.length} {registeredTeams.length === 1 ? "Team" : "Teams"} ({registeredUsersCount} Students)
            </span>
          </div>

          {/* Hover Details Card showing Team Name and Details */}
          {showHover && (
            <div 
              className="position-absolute p-3 rounded-3 shadow-lg bg-white border"
              style={{
                bottom: "105%",
                left: 0,
                right: 0,
                zIndex: 40,
                maxHeight: "260px",
                overflowY: "auto",
                borderColor: "var(--border-color)",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.18)"
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom">
                <span className="fw-bold small text-dark">Registered Campus Teams</span>
                <span className="badge bg-primary-subtle text-primary border" style={{ fontSize: "0.7rem" }}>
                  {registeredTeams.length} Active
                </span>
              </div>

              {registeredTeams.length === 0 ? (
                <div className="text-muted small py-2 text-center">
                  No campus teams registered yet. Be the first to register!
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {registeredTeams.map((team, tIdx) => (
                    <div key={tIdx} className="p-2 rounded-2 bg-light border text-start">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong className="text-primary small">{team.name}</strong>
                        <span className="badge bg-white text-dark border" style={{ fontSize: "0.68rem" }}>
                          {team.members?.length || 0} members
                        </span>
                      </div>

                      <div className="text-muted small ps-1" style={{ fontSize: "0.74rem", lineHeight: "1.5" }}>
                        {(team.members || []).map((m, mIdx) => (
                          <div key={mIdx} className="text-truncate">
                            &bull; <strong>{m.user?.name || "Student"}</strong> ({m.role || m.user?.primaryRole || "Developer"})
                            {m.user?.skills && m.user.skills.length > 0 && (
                              <span className="text-secondary"> &bull; {m.user.skills.slice(0, 3).join(", ")}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className="mt-auto pt-2 border-top d-flex gap-2"
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
