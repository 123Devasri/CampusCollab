import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login attempt failed:", err);
      const msg = err.response?.data?.message || "Invalid email or password. Please try again.";
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
              <h3
                className="fw-bold text-primary mb-1"
              >
                Sign In
              </h3>

              <p
                className="text-muted small"
              >
                Log in to your CampusCollab account
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
              onSubmit={handleLogin}
            >
              <div
                className="mb-3"
              >
                <label
                  className="form-label fw-semibold small"
                >
                  Email Address
                </label>

                <input
                  type="email"
                  className="form-control"
                  placeholder="name@university.edu"
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
                  placeholder="Password"
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
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div
              className="text-center mt-4 pt-3 border-top"
            >
              <p
                className="text-muted small mb-0"
              >
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-primary fw-semibold text-decoration-none"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;