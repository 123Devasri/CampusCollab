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

  // Admin Add Hackathon Modal (only for authenticated admins)
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

  const { isAuthenticated, user } = useAuth();
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
              Discover verified competitions, assemble squads, and register with official organizers.
            </p>
          </div>

          {user?.role === "admin" && (
            <div
              className="d-flex gap-2 align-items-center"
            >
              <button
                onClick={() => setShowAdminModal(true)}
                className="btn btn-primary-custom btn-sm fw-semibold"
              >
                + Add Verified Hackathon
              </button>
            </div>
          )}
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

            {/* Filter Submit Button */}
            <div
              className={sourceCategory === "campus" ? "col-md-2 d-flex align-items-end" : "col-md-4 d-flex align-items-end"}
            >
              <button
                type="submit"
                className="btn btn-primary-custom w-100 btn-sm fw-semibold"
                style={{ height: "31px", marginTop: "auto" }}
              >
                Filter Events
              </button>
            </div>
          </form>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <LoadingState message="Discovering hackathons..." />
        )}

        {/* 1. Campus Verified Hackathons */}
        {!loading && sourceCategory === "campus" && (
          <div>
            {hackathons.length > 0 ? (
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
                message="No campus verified hackathons matched your search criteria."
                actionText="View All Events"
                onActionClick={() => {
                  setSearch("");
                  setModeFilter("All");
                  fetchHackathons();
                }}
              />
            )}
          </div>
        )}

        {/* 2. Unstop Hackathons Tab */}
        {!loading && sourceCategory === "unstop" && (
          <div>
            <div
              className="alert alert-info py-2 mb-4 d-flex justify-content-between align-items-center"
            >
              <span
                className="small"
              >
                Direct competitions hosted on <strong>Unstop</strong>. Apply directly on their portal.
              </span>

              <a
                href="https://unstop.com/hackathons"
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline-primary"
              >
                Visit Unstop.com ↗
              </a>
            </div>

            {externalNews.length > 0 ? (
              <div
                className="row g-4"
              >
                {externalNews.map((item, idx) => (
                  <div
                    key={idx}
                    className="col-md-6 col-lg-4"
                  >
                    <div
                      className="card h-100 border shadow-sm rounded-3 bg-white d-flex flex-column"
                    >
                      <div
                        className="card-body p-4 d-flex flex-column"
                      >
                        <div
                          className="d-flex justify-content-between align-items-start mb-2"
                        >
                          <span
                            className="badge bg-primary-subtle text-primary border"
                          >
                            Unstop Official
                          </span>

                          <span
                            className="text-muted small"
                          >
                            {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "Active"}
                          </span>
                        </div>

                        <h5
                          className="card-title fw-bold text-primary mb-2 fs-6"
                        >
                          {item.title}
                        </h5>

                        <p
                          className="card-text text-muted small flex-grow-1"
                        >
                          {item.description || "Exciting hackathon opportunity available for college students and engineering teams."}
                        </p>

                        <div
                          className="pt-3 border-top mt-auto d-flex justify-content-between align-items-center"
                        >
                          <span
                            className="small text-secondary fw-semibold"
                          >
                            {item.source?.name || "Unstop"}
                          </span>

                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary-custom btn-sm fw-semibold"
                          >
                            Register on Unstop ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No External Feed"
                message="Could not load external Unstop events at this time."
                actionText="Retry"
                onActionClick={fetchExternalNews}
              />
            )}
          </div>
        )}

        {/* 3. Global Tech Hackathons Tab */}
        {!loading && sourceCategory === "global" && (
          <div>
            <div
              className="alert alert-secondary py-2 mb-4 d-flex justify-content-between align-items-center"
            >
              <span
                className="small"
              >
                Worldwide developer hackathons from <strong>MLH, Devpost, IEEE & Tech Communities</strong>.
              </span>
            </div>

            {externalNews.length > 0 ? (
              <div
                className="row g-4"
              >
                {externalNews.map((item, idx) => (
                  <div
                    key={idx}
                    className="col-md-6 col-lg-4"
                  >
                    <div
                      className="card h-100 border shadow-sm rounded-3 bg-white d-flex flex-column"
                    >
                      <div
                        className="card-body p-4 d-flex flex-column"
                      >
                        <div
                          className="d-flex justify-content-between align-items-start mb-2"
                        >
                          <span
                            className="badge bg-secondary-subtle text-secondary border"
                          >
                            Global Event
                          </span>

                          <span
                            className="text-muted small"
                          >
                            {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "Global"}
                          </span>
                        </div>

                        <h5
                          className="card-title fw-bold text-primary mb-2 fs-6"
                        >
                          {item.title}
                        </h5>

                        <p
                          className="card-text text-muted small flex-grow-1"
                        >
                          {item.description || "Global developer competition open to international student developers."}
                        </p>

                        <div
                          className="pt-3 border-top mt-auto d-flex justify-content-between align-items-center"
                        >
                          <span
                            className="small text-secondary fw-semibold"
                          >
                            {item.source?.name || "Global"}
                          </span>

                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline-custom btn-sm fw-semibold"
                          >
                            Apply on Official Site ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Global Events Loaded"
                message="Could not load global hackathons right now."
                actionText="Retry"
                onActionClick={fetchExternalNews}
              />
            )}
          </div>
        )}
      </div>

      {/* Admin Quick Add Hackathon Modal */}
      {user?.role === "admin" && (
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
      )}
    </div>
  );
}

export default Hackathon;