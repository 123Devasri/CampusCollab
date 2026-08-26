import React from "react";
import { Link } from "react-router-dom";

function EmptyState({
  title = "No Items Found",
  message = "There are no records matching your current filter.",
  actionText,
  actionLink,
  onActionClick
}) {
  return (
    <div
      className="text-center py-5 px-3 bg-white rounded-3 border my-3 shadow-sm"
    >
      <h5
        className="fw-bold text-dark mb-2 fs-5"
      >
        {title}
      </h5>

      <p
        className="text-muted mb-4 mx-auto small"
        style={{ maxWidth: "480px" }}
      >
        {message}
      </p>

      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="btn btn-primary-custom btn-sm fw-semibold"
        >
          {actionText}
        </Link>
      )}

      {actionText && onActionClick && (
        <button
          onClick={onActionClick}
          className="btn btn-primary-custom btn-sm fw-semibold"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
