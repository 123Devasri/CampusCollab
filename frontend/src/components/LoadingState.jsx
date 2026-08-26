import React from "react";

function LoadingState({ message = "Loading content..." }) {
  return (
    <div
      className="text-center py-5"
    >
      <div
        className="spinner-border text-primary mb-3"
        role="status"
        style={{ width: "3rem", height: "3rem" }}
      >
        <span
          className="visually-hidden"
        >
          Loading...
        </span>
      </div>

      <p
        className="text-muted fs-5"
      >
        {message}
      </p>
    </div>
  );
}

export default LoadingState;
