import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import LoadingState from "../components/LoadingState";
import HackathonCard from "../components/HackathonCard";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

function Hackathon() {
  const [hackathons, setHackathons] = useState([]);
  const [externalNews, setExternalNews] = useState([]);
  const [sourceCategory, setSourceCategory] = useState("campus"); // campus, unstop, global
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // Admin Add Hackathon Modal
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: "",
    organizer: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    registrationDeadline: new Date().toISOString().split("T")[0],
    mode: "Online",
    location: "Virtual / Campus",
    technology: "Web / Mobile / AI",
    eligibility: "College Students",
    officialUrl: "https://",
    prizePool: "₹50,000"
  });
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [adminSuccessMsg, setAdminSuccessMsg] = useState("");

  // Quick Admin Login Modal
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminLoginEmail, setAdminLoginEmail] = useState("admin@campuscollab.edu");
  const [adminLoginPassword, setAdminLoginPassword] = useState("123456");
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState("");

  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      const res = await API.get("/hackathons", {
        params: {
          search: search || undefined,
          mode: modeFilter !== "All" ? modeFilter : undefined
        }
      });
      setHackathons(res.data);
    } catch (err) {
      console.error("Hackathons load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExternalNews = async () => {
    try {
      setLoading(true);
      const query = sourceCategory === "unstop" ? "unstop hackathon" : (search || "hackathon");
      const res = await API.get("/hackathons/external", {
        params: { q: query }
      });
      setExternalNews(res.data);
    } catch (err) {
      console.error("External news load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sourceCategory === "campus") {
      fetchHackathons();
    } else {
      fetchExternalNews();
    }
  }, [sourceCategory, modeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (sourceCategory === "campus") {
      fetchHackathons();
    } else {
      fetchExternalNews();
    }
  };

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setAdminLoginError("");
    try {
      setAdminLoginLoading(true);
      await login(adminLoginEmail, adminLoginPassword);
      setShowAdminLoginModal(false);
      setShowAdminModal(true); // Directly open the add hackathon modal upon successful admin login
      setAdminSuccessMsg("Logged in as Administrator. You can now add campus verified hackathons.");
      setTimeout(() => setAdminSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Admin login error:", err);
      setAdminLoginError(err.response?.data?.message || "Invalid admin credentials.");
    } finally {
      setAdminLoginLoading(false);
    }
  };

  const handleAdminCreateSubmit = async (e) => {
    e.preventDefault();
    if (!adminForm.name.trim() || !adminForm.organizer.trim()) return;

    try {
      setSavingAdmin(true);
      await API.post("/hackathons", adminForm);
      setAdminSuccessMsg(`Verified hackathon '${adminForm.name}' added successfully!`);
      setShowAdminModal(false);
      fetchHackathons();
      setTimeout(() => setAdminSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Admin save error:", err);
      alert(err.response?.data?.message || "Failed to create hackathon.");
    } finally {
      setSavingAdmin(false);
    }
  };

  return (
    <div
      className="hackathons-page py-4"
    >
      <div
        className="container"
      >
        {/* Page Header */}
        <div
          className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4"
        >
          <div>
            <h3
              className="fw-bold text-primary mb-1"
            >
              Hackathon Directory
            </h3>

            <p
              className="text-muted mb-0 small"
            >
              Discover competitions, assemble teams, and register with official organizers.
            </p>
          </div>

          <div
            className="d-flex gap-2 align-items-center"
          >
            {user?.role === "admin" ? (
              <button
                onClick={() => setShowAdminModal(true)}
                className="btn btn-primary-custom btn-sm fw-semibold"
              >
                + Add Verified Hackathon
              </button>
            ) : (
              <button
                onClick={() => setShowAdminLoginModal(true)}
                className="btn btn-outline-primary btn-sm fw-semibold"
              >
                Admin Login (Add Hackathons)
              </button>
            )}
          </div>
        </div>

        {adminSuccessMsg && (
          <div
            className="alert alert-success py-2 mb-4 alert-dismissible fade show"
            role="alert"
          >
            {adminSuccessMsg}
          </div>
        )}

        {/* Simplified Control Bar with Dropdown */}
        <div
          className="card border shadow-sm rounded-3 p-3 bg-white mb-4"
        >
          <form
            onSubmit={handleSearchSubmit}
            className="row g-2 align-items-center"
          >
            {/* Category Dropdown */}
            <div
              className="col-md-3"
            >
              <label
                className="form-label small text-muted fw-semibold mb-1"
              >
                Source:
              </label>

              <select
                className="form-select form-select-sm"
                value={sourceCategory}
                onChange={(e) => setSourceCategory(e.target.value)}
              >
                <option
                  value="campus"
                >
                  Campus Verified Hackathons
                </option>

                <option
                  value="unstop"
                >
                  Unstop Hackathons
                </option>

                <option
                  value="global"
                >
                  Global Tech Hackathons
                </option>
              </select>
            </div>

            {/* Search Input */}
            <div
              className="col-md-5"
            >
              <label
                className="form-label small text-muted fw-semibold mb-1"
              >
                Search:
              </label>

              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search by name, technology, or organizer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Mode Filter (for Campus) */}
            {sourceCategory === "campus" && (
              <div
                className="col-md-2"
              >
                <label
                  className="form-label small text-muted fw-semibold mb-1"
                >
                  Mode:
                </label>

                <select
                  className="form-select form-select-sm"
                  value={modeFilter}
                  onChange={(e) => setModeFilter(e.target.value)}
                >
                  <option
                    value="All"
                  >
                    All Modes
                  </option>

                  <option
                    value="Online"
                  >
                    Online
                  </option>

                  <option
                    value="Offline"
                  >
                    Offline
                  </option>

                  <option
                    value="Hybrid"
                  >
                    Hybrid
                  </option>
                </select>
              </div>
            )}

            {/* Submit Button */}
            <div
              className={`col-md-${sourceCategory === "campus" ? "2" : "4"} mt-auto`}
            >
              <button
                type="submit"
                className="btn btn-primary-custom btn-sm w-100 fw-semibold"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Content Area */}
        {loading ? (
          <LoadingState message="Loading hackathons..." />
        ) : sourceCategory === "campus" ? (
          hackathons.length > 0 ? (
            <div
              className="row g-4"
            >
              {hackathons.map((hackathon) => (
                <div
                  key={hackathon._id}
                  className="col-md-6 col-lg-4"
                >
                  <HackathonCard
                    hackathon={hackathon}
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Hackathons Found"
              message="No campus hackathons match your search criteria."
              actionText="Clear Filter"
              onActionClick={() => {
                setSearch("");
                setModeFilter("All");
                fetchHackathons();
              }}
            />
          )
        ) : (
          /* Unstop or Global Feed */
          <div>
            <div
              className="alert alert-info py-2 px-3 small mb-4 bg-info-subtle text-info-emphasis border d-flex justify-content-between align-items-center flex-wrap gap-2"
            >
              <div>
                Showing live competitions from {sourceCategory === "unstop" ? "Unstop Hackathons" : "Global Tech Hubs"}.
              </div>

              <a
                href="https://unstop.com/hackathons"
                target="_blank"
                rel="noreferrer"
                className="fw-semibold text-decoration-none"
              >
                Open Unstop Official Portal ↗
              </a>
            </div>

            {externalNews.length > 0 ? (
              <div
                className="row g-4"
              >
                {externalNews.map((item) => (
                  <div
                    key={item.id}
                    className="col-md-6 col-lg-4"
                  >
                    <div
                      className="card h-100 border shadow-sm rounded-3 custom-card card-hover-lift"
                    >
                      <div
                        className="card-body p-4 d-flex flex-column"
                      >
                        <span
                          className="badge bg-secondary-subtle text-secondary border small mb-2 align-self-start"
                        >
                          Source: {item.source}
                        </span>

                        <h6
                          className="fw-bold text-primary mb-2 fs-5"
                        >
                          {item.title}
                        </h6>

                        <p
                          className="text-secondary small mb-3 text-truncate-3"
                          style={{ minHeight: "44px" }}
                        >
                          {item.description}
                        </p>

                        <div
                          className="mt-auto pt-3 border-top"
                        >
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline-custom btn-sm w-100 text-center"
                          >
                            View Details on Portal ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Events Found"
                message="Feed is currently loading or unavailable."
              />
            )}
          </div>
        )}
      </div>

      {/* Admin Login Modal */}
      <Modal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        title="Admin Login"
      >
        <form
          onSubmit={handleAdminLoginSubmit}
        >
          {adminLoginError && (
            <div
              className="alert alert-danger py-2 small mb-3"
            >
              {adminLoginError}
            </div>
          )}

          <div
            className="p-2 mb-3 bg-light rounded border text-center small text-muted"
          >
            Use admin credentials to verify & publish official campus hackathons.
            <br />
            <strong>Demo Admin:</strong> admin@campuscollab.edu / <strong>123456</strong>
          </div>

          <div
            className="mb-3"
          >
            <label
              className="form-label fw-semibold small"
            >
              Admin Email
            </label>

            <input
              type="email"
              className="form-control"
              value={adminLoginEmail}
              onChange={(e) => setAdminLoginEmail(e.target.value)}
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
              value={adminLoginPassword}
              onChange={(e) => setAdminLoginPassword(e.target.value)}
              required
            />
          </div>

          <div
            className="d-flex justify-content-end gap-2"
          >
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowAdminLoginModal(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={adminLoginLoading}
              className="btn btn-primary-custom fw-semibold"
            >
              {adminLoginLoading ? "Logging in..." : "Login & Add Hackathon"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Admin Quick Add Hackathon Modal */}
      <Modal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        title="Add Campus Verified Hackathon"
      >
        <form
          onSubmit={handleAdminCreateSubmit}
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
                Hackathon Name *
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="e.g. Smart India Hackathon"
                value={adminForm.name}
                onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                required
              />
            </div>

            <div
              className="col-md-6"
            >
              <label
                className="form-label fw-semibold small"
              >
                Organizer *
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="e.g. AICTE & MoE"
                value={adminForm.organizer}
                onChange={(e) => setAdminForm({ ...adminForm, organizer: e.target.value })}
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
              Description *
            </label>

            <textarea
              className="form-control"
              rows="3"
              placeholder="Event overview, problem statements..."
              value={adminForm.description}
              onChange={(e) => setAdminForm({ ...adminForm, description: e.target.value })}
              required
            >
            </textarea>
          </div>

          <div
            className="row g-3 mb-3"
          >
            <div
              className="col-md-4"
            >
              <label
                className="form-label fw-semibold small"
              >
                Mode
              </label>

              <select
                className="form-select"
                value={adminForm.mode}
                onChange={(e) => setAdminForm({ ...adminForm, mode: e.target.value })}
              >
                <option
                  value="Online"
                >
                  Online
                </option>

                <option
                  value="Offline"
                >
                  Offline
                </option>

                <option
                  value="Hybrid"
                >
                  Hybrid
                </option>
              </select>
            </div>

            <div
              className="col-md-4"
            >
              <label
                className="form-label fw-semibold small"
              >
                Registration Deadline *
              </label>

              <input
                type="date"
                className="form-control"
                value={adminForm.registrationDeadline}
                onChange={(e) => setAdminForm({ ...adminForm, registrationDeadline: e.target.value })}
                required
              />
            </div>

            <div
              className="col-md-4"
            >
              <label
                className="form-label fw-semibold small"
              >
                Prize Pool
              </label>

              <input
                type="text"
                className="form-control"
                value={adminForm.prizePool}
                onChange={(e) => setAdminForm({ ...adminForm, prizePool: e.target.value })}
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
                Technology Themes
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="AI, Web, Cloud, IoT"
                value={adminForm.technology}
                onChange={(e) => setAdminForm({ ...adminForm, technology: e.target.value })}
              />
            </div>

            <div
              className="col-md-6"
            >
              <label
                className="form-label fw-semibold small"
              >
                Official Registration URL *
              </label>

              <input
                type="url"
                className="form-control"
                placeholder="https://..."
                value={adminForm.officialUrl}
                onChange={(e) => setAdminForm({ ...adminForm, officialUrl: e.target.value })}
                required
              />
            </div>
          </div>

          <div
            className="d-flex justify-content-end gap-2"
          >
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowAdminModal(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={savingAdmin}
              className="btn btn-primary-custom fw-semibold"
            >
              {savingAdmin ? "Saving..." : "Add Hackathon"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Hackathon;