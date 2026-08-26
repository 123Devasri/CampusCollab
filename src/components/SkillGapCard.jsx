import React from "react";
import { Link } from "react-router-dom";

function SkillGapCard({ skillGap, teamId, onFindTeammatesClick }) {
  if (!skillGap) return null;

  const covered = skillGap.coveredSkills || skillGap.covered || [];
  const missing = skillGap.missingSkills || skillGap.missing || [];
  const required = skillGap.requiredSkills || skillGap.required || [];
  const percentage = typeof skillGap.coveragePercentage === "number"
    ? skillGap.coveragePercentage
    : typeof skillGap.percentage === "number"
    ? skillGap.percentage
    : required.length > 0
    ? Math.round((covered.length / required.length) * 100)
    : 100;

  const getProgressColor = (percent) => {
    if (percent >= 100) return "bg-success";
    if (percent >= 60) return "bg-primary";
    if (percent >= 30) return "bg-warning";
    return "bg-danger";
  };

  return (
    <div
      className="card border shadow-sm rounded-3 p-3 mb-4 bg-white"
    >
      <div
        className="d-flex justify-content-between align-items-center mb-2"
      >
        <h6
          className="fw-bold mb-0 text-dark"
        >
          Team Skill Coverage
        </h6>

        <span
          className={`badge fs-6 ${percentage === 100 ? "bg-success text-white" : "bg-primary text-white"}`}
        >
          {percentage}%
        </span>
      </div>

      <div
        className="progress mb-3"
        style={{ height: "8px" }}
      >
        <div
          className={`progress-bar ${getProgressColor(percentage)}`}
          role="progressbar"
          style={{ width: `${percentage}%` }}
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        >
        </div>
      </div>

      <div
        className="row g-2 mb-3"
      >
        <div
          className="col-md-6"
        >
          <p
            className="fw-semibold text-success mb-1 small"
          >
            Covered Skills ({covered.length}):
          </p>

          <div
            className="d-flex flex-wrap gap-1"
          >
            {covered.length > 0 ? (
              covered.map((skill, idx) => (
                <span
                  key={idx}
                  className="badge bg-success-subtle text-success border border-success px-2 py-1"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span
                className="text-muted small"
              >
                None yet
              </span>
            )}
          </div>
        </div>

        <div
          className="col-md-6"
        >
          <p
            className="fw-semibold text-warning-emphasis mb-1 small"
          >
            Missing Skills ({missing.length}):
          </p>

          <div
            className="d-flex flex-wrap gap-1"
          >
            {missing.length > 0 ? (
              missing.map((skill, idx) => (
                <span
                  key={idx}
                  className="badge bg-warning-subtle text-warning-emphasis border border-warning px-2 py-1"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span
                className="text-success small fw-semibold"
              >
                All required skills covered
              </span>
            )}
          </div>
        </div>
      </div>

      {missing.length > 0 && (
        <div
          className="mt-2 text-end"
        >
          {onFindTeammatesClick ? (
            <button
              onClick={onFindTeammatesClick}
              className="btn btn-outline-primary btn-sm fw-semibold"
            >
              Find Teammates for Gaps
            </button>
          ) : teamId ? (
            <Link
              to={`/teams/${teamId}#recommendations`}
              className="btn btn-outline-primary btn-sm fw-semibold"
            >
              Find Teammates for Gaps
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default SkillGapCard;
