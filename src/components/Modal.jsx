import React from "react";

function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(4px)", zIndex: 1050 }}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
      >
        <div
          className="modal-content border shadow-lg rounded-3 bg-white"
          style={{ borderColor: "var(--border-color)" }}
        >
          <div
            className="modal-header border-bottom px-4 py-3 bg-white d-flex align-items-center justify-content-between"
          >
            <h5
              className="modal-title fw-bold text-primary mb-0 fs-5"
            >
              {title}
            </h5>

            <button
              type="button"
              className="btn-close shadow-none"
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
              className="modal-footer border-top bg-light px-4 py-3"
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
