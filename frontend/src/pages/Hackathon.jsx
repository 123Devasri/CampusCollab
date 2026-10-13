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
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // Admin Add Hackathon Modal state (only for authenticated admins)
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

  const { user } = useAuth();
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

  useEffect(() => {
    fetchHackathons();
  }, [modeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHackathons();
  };

  const handleAdminCreateSubmit = async (e) => {
    e.preventDefault();
    if (!adminForm.name.trim() || !adminForm.organizer.trim()) return;

    try {
      setSavingAdmin(true);
      await API.post("/hackathons", adminForm);
      setAdminSuccessMsg(`Verified hackathon '${adminForm.name}' added successfully.`);
      setShowAdminModal(false);
      setAdminForm({
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
    <div className="hackathons-page py-4">
      <div className="container">
        {/* Top Header & Admin Action */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h3 className="fw-bold text-dark mb-1">Campus Verified Hackathons</h3>
            <span className="text-muted small">
              Official university and partner hackathons. Hover over registered squads to view team members.
            </span>
          </div>

          {user?.role === "admin" && (
            <button
              onClick={() => setShowAdminModal(true)}
              className="btn btn-primary-custom btn-sm fw-semibold shadow-sm"
              title="Add a new verified hackathon competition"
            >
              + Add Hackathon
            </button>
          )}
        </div>

        {adminSuccessMsg && (
          <div className="alert alert-success py-2 mb-4 alert-dismissible fade show" role="alert">
            {adminSuccessMsg}
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="card border shadow-sm rounded-3 p-3 bg-white mb-4">
          <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
            <div className="col-md-7">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search hackathons by name, technology, or organizer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <select
                className="form-select form-select-sm"
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
              >
                <option value="All">All Modes</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="col-md-2">
              <button
                type="submit"
                className="btn btn-primary-custom w-100 btn-sm fw-semibold"
              >
                Filter Events
              </button>
            </div>
          </form>
        </div>

        {/* Hackathon Cards Grid */}
        {loading ? (
          <LoadingState message="Loading campus verified hackathons..." />
        ) : hackathons.length > 0 ? (
          <div className="row g-4">
            {hackathons.map((hackathon) => (
              <div key={hackathon._id} className="col-md-6 col-lg-4">
                <HackathonCard hackathon={hackathon} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Hackathons Found"
            message="No campus verified hackathons match your search criteria."
            actionText="View All Events"
            onActionClick={() => {
              setSearch("");
              setModeFilter("All");
              fetchHackathons();
            }}
          />
        )}
      </div>

      {/* Admin Quick Add Hackathon Modal */}
      {user?.role === "admin" && (
        <Modal
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
          title="Add Campus Verified Hackathon"
        >
          <form onSubmit={handleAdminCreateSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold small">Hackathon Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Smart India Hackathon 2026"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small">Organizer *</label>
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

            <div className="mb-3">
              <label className="form-label fw-semibold small">Description *</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Event overview, problem statements, rules..."
                value={adminForm.description}
                onChange={(e) => setAdminForm({ ...adminForm, description: e.target.value })}
                required
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold small">Mode</label>
                <select
                  className="form-select"
                  value={adminForm.mode}
                  onChange={(e) => setAdminForm({ ...adminForm, mode: e.target.value })}
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold small">Registration Deadline *</label>
                <input
                  type="date"
                  className="form-control"
                  value={adminForm.registrationDeadline}
                  onChange={(e) => setAdminForm({ ...adminForm, registrationDeadline: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold small">Prize Pool</label>
                <input
                  type="text"
                  className="form-control"
                  value={adminForm.prizePool}
                  onChange={(e) => setAdminForm({ ...adminForm, prizePool: e.target.value })}
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold small">Technology Themes</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="AI, Web, Cloud, IoT"
                  value={adminForm.technology}
                  onChange={(e) => setAdminForm({ ...adminForm, technology: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small">Official Registration URL *</label>
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

            <div className="d-flex justify-content-end gap-2">
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
                {savingAdmin ? "Publishing..." : "Publish Hackathon"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Hackathon;