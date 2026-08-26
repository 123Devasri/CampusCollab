import React from "react";

function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
      >
        <div
          className="modal-content border-0 shadow-lg rounded-3"
        >
          <div
            className="modal-header bg-primary text-white"
          >
            <h5
              className="modal-title fw-bold"
            >
              {title}
            </h5>

            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={onClose}
            >
            </button>
          </div>

          <div
            className="modal-body p-4"
          >
            {children}
          </div>

          {footer && (
            <div
              className="modal-footer bg-light"
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;
