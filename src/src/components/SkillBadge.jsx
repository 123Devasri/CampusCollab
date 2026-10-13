import React from "react";

function SkillBadge({ name, onRemove, variant = "default" }) {
  const getBadgeStyle = () => {
    switch (variant) {
      case "success":
        return "bg-success-subtle text-success border-success";
      case "warning":
        return "bg-warning-subtle text-warning-emphasis border-warning";
      case "danger":
        return "bg-danger-subtle text-danger border-danger";
      case "dark":
        return "bg-dark text-white border-dark";
      default:
        return "bg-primary-subtle text-primary border-primary";
    }
  };

  return (
    <span
      className={`badge border px-2 py-1 me-1 mb-1 fw-semibold d-inline-flex align-items-center ${getBadgeStyle()}`}
      style={{ fontSize: "0.85rem" }}
    >
      <span>
        {name}
      </span>

      {onRemove && (
        <button
          type="button"
          className="btn-close btn-close-sm ms-2"
          aria-label="Remove skill"
          onClick={() => onRemove(name)}
          style={{ fontSize: "0.55rem" }}
        >
        </button>
      )}
    </span>
  );
}

export default SkillBadge;
