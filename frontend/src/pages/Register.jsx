import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    course: "Computer Science",
    year: "2nd Year",
    primaryRole: "Frontend Developer",
    skills: "React, JavaScript, HTML, CSS"
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in your Name, Email, and Password.");
      return;
    }

    const skillsArray = formData.skills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      setLoading(true);
      await register({
        ...formData,
        skills: skillsArray
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      const msg = err.response?.data?.message || "Registration failed. Please check your inputs.";
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
          className="col-md-8 col-lg-6"
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
                Create Student Account
              </h3>

              <p
                className="text-muted small"
              >
                Join the student hackathon and project collaboration network
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
              onSubmit={handleRegister}
            >
              <div
                className="row g-3 mb-3"
              >
                <div
                  className="col-md-6"
                >
                  <label
                    className="form-label fw-semibold small"
                  >
                    Full Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Student Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div
                  className="col-md-6"
                >
                  <label
                    className="form-label fw-semibold small"
                  >
                    Email Address *
                  </label>

                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="student@university.edu"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div
                className="mb-3"
              >
                <label
                  className="form-label fw-semibold small"
                >
                  Password *
                </label>

                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div
                className="row g-3 mb-3"
              >
                <div
                  className="col-md-6"
                >
                  <label
                    className="form-label fw-semibold small"
                  >
                    College / University
                  </label>

                  <input
                    type="text"
                    name="college"
                    className="form-control"
                    placeholder="University Name"
                    value={formData.college}
                    onChange={handleChange}
                  />
                </div>

                <div
                  className="col-md-6"
                >
                  <label
                    className="form-label fw-semibold small"
                  >
                    Course / Major
                  </label>

                  <input
                    type="text"
                    name="course"
                    className="form-control"
                    placeholder="e.g. Computer Science"
                    value={formData.course}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div
                className="row g-3 mb-3"
              >
                <div
                  className="col-md-6"
                >
                  <label
                    className="form-label fw-semibold small"
                  >
                    Year of Study
                  </label>

                  <select
                    name="year"
                    className="form-select"
                    value={formData.year}
                    onChange={handleChange}
                  >
                    <option
                      value="1st Year"
                    >
                      1st Year
                    </option>

                    <option
                      value="2nd Year"
                    >
                      2nd Year
                    </option>

                    <option
                      value="3rd Year"
                    >
                      3rd Year
                    </option>

                    <option
                      value="4th Year"
                    >
                      4th Year
                    </option>

                    <option
                      value="Postgraduate"
                    >
                      Postgraduate
                    </option>
                  </select>
                </div>

                <div
                  className="col-md-6"
                >
                  <label
                    className="form-label fw-semibold small"
                  >
                    Primary Role
                  </label>

                  <select
                    name="primaryRole"
                    className="form-select"
                    value={formData.primaryRole}
                    onChange={handleChange}
                  >
                    <option
                      value="Frontend Developer"
                    >
                      Frontend Developer
                    </option>

                    <option
                      value="Backend Developer"
                    >
                      Backend Developer
                    </option>

                    <option
                      value="Full Stack Developer"
                    >
                      Full Stack Developer
                    </option>

                    <option
                      value="ML Developer"
                    >
                      ML Developer
                    </option>

                    <option
                      value="UI/UX Designer"
                    >
                      UI/UX Designer
                    </option>

                    <option
                      value="Database Developer"
                    >
                      Database Developer
                    </option>
                  </select>
                </div>
              </div>

              <div
                className="mb-4"
              >
                <label
                  className="form-label fw-semibold small"
                >
                  Technical Skills (comma separated)
                </label>

                <input
                  type="text"
                  name="skills"
                  className="form-control"
                  placeholder="React, JavaScript, HTML, CSS, Node.js"
                  value={formData.skills}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary-custom w-100 py-2 fw-semibold"
                style={{ fontSize: "1rem" }}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div
              className="text-center mt-4 pt-3 border-top"
            >
              <p
                className="text-muted small mb-0"
              >
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary fw-semibold text-decoration-none"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
