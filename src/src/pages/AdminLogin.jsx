import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both administrator email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res?.role === "admin" || res?.user?.role === "admin") {
        navigate("/admin/hackathons");
      } else {
        // If a regular student logs in through the admin portal
        setError("This account does not have administrator privileges. Please use the student login.");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      const msg = err.response?.data?.message || "Invalid administrator credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container py-5"
    >
      <div
        className="row justify-content-center"
      >
        <div
          className="col-md-6 col-lg-5"
        >
          <div
            className="card border shadow-sm rounded-3 p-4 bg-white"
          >
            <div
              className="text-center mb-4"
            >
              <div
                className="d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle mb-3"
                style={{ width: "48px", height: "48px" }}
              >
                <span
                  style={{ fontSize: "1.4rem" }}
                >
                  🛡️
                </span>
              </div>

              <h3
                className="fw-bold text-primary mb-1"
              >
                Administrator Portal
              </h3>

              <p
                className="text-muted small mb-0"
              >
                Campus Coordinator & Event Manager Login
              </p>
            </div>

            {error && (
              <div
                className="alert alert-danger py-2 small mb-3"
                role="alert"
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
            >
              <div
                className="mb-3"
              >
                <label
                  className="form-label fw-semibold small"
                >
                  Admin Email Address
                </label>

                <input
                  type="email"
                  className="form-control"
                  placeholder="admin@campuscollab.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div
                className="mb-4"
              >
                <label
                  className="form-label fw-semibold small"
                >
                  Password
                </label>

                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter administrator password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary-custom w-100 py-2 fw-semibold"
              >
                {loading ? "Verifying..." : "Sign In to Admin Panel"}
              </button>
            </form>

            <div
              className="text-center mt-4 pt-3 border-top"
            >
              <p
                className="text-muted small mb-0"
              >
                Are you a student developer?{" "}
                <Link
                  to="/login"
                  className="text-primary fw-semibold text-decoration-none"
                >
                  Student Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
