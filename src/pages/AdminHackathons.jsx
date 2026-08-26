import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import LoadingState from "../components/LoadingState";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";

function AdminHackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [form, setForm] = useState({
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

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadHackathons = async () => {
    try {
      setLoading(true);
      const res = await API.get("/hackathons");
      setHackathons(res.data);
    } catch (err) {
      console.error("Load hackathons error:", err);
      setErrorMsg("Failed to load hackathons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHackathons();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setForm({
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
    setShowInlineForm(true);
    setShowModal(true);
  };

  const handleOpenEdit = (h) => {
    setIsEditing(true);
    setCurrentId(h._id);
    setForm({
      name: h.name,
      organizer: h.organizer,
      description: h.description,
      startDate: h.startDate,
      endDate: h.endDate,
      registrationDeadline: h.registrationDeadline,
      mode: h.mode,
      location: h.location,
      technology: h.technology,
      eligibility: h.eligibility,
      officialUrl: h.officialUrl,
      prizePool: h.prizePool
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      setSaving(true);
      if (isEditing) {
        await API.put(`/hackathons/${currentId}`, form);
        setSuccessMsg("Hackathon updated successfully.");
      } else {
        await API.post("/hackathons", form);
        setSuccessMsg("Hackathon created successfully.");
      }
      setShowModal(false);
      setShowInlineForm(false);
      loadHackathons();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Save error:", err);
      setErrorMsg(err.response?.data?.message || "Failed to save hackathon.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete '${name}'?`)) return;
    try {
      await API.delete(`/hackathons/${id}`);
      setSuccessMsg(`Deleted '${name}'`);
      loadHackathons();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete hackathon.");
    }
  };

  return (
    <div
      className="admin-hackathons py-4"
    >
      <div
        className="container"
      >
        <div
          className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2"
        >
          <div>
            <h3
              className="fw-bold text-primary mb-1"
            >
              Admin Hackathon Management
            </h3>

            <p
              className="text-muted mb-0 small"
            >
              Verify, publish, and manage official hackathons displayed to students.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="btn btn-primary-custom fw-semibold"
          >
            + Add Hackathon
          </button>
        </div>

        {successMsg && (
          <div
            className="alert alert-success py-2 alert-dismissible fade show"
            role="alert"
          >
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div
            className="alert alert-danger py-2"
            role="alert"
          >
            {errorMsg}
          </div>
        )}

        {/* Inline Add Hackathon Form Card */}
        {showInlineForm && (
          <div
            className="card border shadow-sm rounded-3 p-4 bg-white mb-4"
          >
            <div
              className="d-flex justify-content-between align-items-center mb-3"
            >
              <h5
                className="fw-bold text-primary mb-0"
              >
                Add New Campus Verified Hackathon
              </h5>

              <button
                type="button"
                className="btn-close"
                onClick={() => setShowInlineForm(false)}
              >
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
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
                    placeholder="e.g. Smart India Hackathon 2026"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div
                  className="col-md-6"
                >
                  <label
                    className="form-label fw-semibold small"
                  >
                    Organizer / University *
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. AICTE & MoE"
                    value={form.organizer}
                    onChange={(e) => setForm({ ...form, organizer: e.target.value })}
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
                  Event Description *
                </label>

                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Details on theme, problem statements, and judging..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                    value={form.mode}
                    onChange={(e) => setForm({ ...form, mode: e.target.value })}
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
                    Location / Venue
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Campus / Virtual"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
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
                    placeholder="₹50,000"
                    value={form.prizePool}
                    onChange={(e) => setForm({ ...form, prizePool: e.target.value })}
                  />
                </div>
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
                    Registration Deadline *
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    value={form.registrationDeadline}
                    onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                    required
                  />
                </div>

                <div
                  className="col-md-4"
                >
                  <label
                    className="form-label fw-semibold small"
                  >
                    Start Date *
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                  />
                </div>

                <div
                  className="col-md-4"
                >
                  <label
                    className="form-label fw-semibold small"
                  >
                    End Date *
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    required
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
                    placeholder="AI/ML, Web, Mobile, Cloud"
                    value={form.technology}
                    onChange={(e) => setForm({ ...form, technology: e.target.value })}
                  />
                </div>

                <div
                  className="col-md-6"
                >
                  <label
                    className="form-label fw-semibold small"
                  >
                    Official Website / Registration URL *
                  </label>

                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://..."
                    value={form.officialUrl}
                    onChange={(e) => setForm({ ...form, officialUrl: e.target.value })}
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
                  onClick={() => setShowInlineForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary-custom fw-semibold"
                >
                  {saving ? "Publishing..." : "Publish Hackathon"}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <LoadingState message="Loading hackathons for admin..." />
        ) : hackathons.length > 0 ? (
          <div
            className="card border shadow-sm rounded-3 bg-white"
          >
            <div
              className="table-responsive"
            >
              <table
                className="table table-hover align-middle mb-0"
              >
                <thead
                  className="table-light"
                >
                  <tr>
                    <th>
                      Hackathon Name
                    </th>

                    <th>
                      Organizer
                    </th>

                    <th>
                      Mode
                    </th>

                    <th>
                      Deadline
                    </th>

                    <th>
                      Dates
                    </th>

                    <th>
                      Prizes
                    </th>

                    <th
                      className="text-end"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {hackathons.map((h) => (
                    <tr
                      key={h._id}
                    >
                      <td>
                        <strong>{h.name}</strong>
                      </td>

                      <td
                        className="small text-muted"
                      >
                        {h.organizer}
                      </td>

                      <td>
                        <span
                          className={`badge ${h.mode === "Online" ? "bg-success" : h.mode === "Offline" ? "bg-secondary" : "bg-info text-dark"}`}
                        >
                          {h.mode}
                        </span>
                      </td>

                      <td
                        className="small"
                      >
                        {h.registrationDeadline}
                      </td>

                      <td
                        className="small text-muted"
                      >
                        {h.startDate} - {h.endDate}
                      </td>

                      <td
                        className="small text-success fw-semibold"
                      >
                        {h.prizePool}
                      </td>

                      <td
                        className="text-end"
                      >
                        <div
                          className="btn-group btn-group-sm"
                        >
                          <button
                            onClick={() => handleOpenEdit(h)}
                            className="btn btn-outline-primary"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(h._id, h.name)}
                            className="btn btn-outline-danger"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No Hackathons Listed"
            message="Click below to add your first official verified campus hackathon."
            actionText="Add Hackathon"
            onActionClick={handleOpenCreate}
          />
        )}
      </div>

      {/* Modal View for Edit */}
      <Modal
        isOpen={showModal && isEditing}
        onClose={() => setShowModal(false)}
        title="Edit Hackathon Event"
      >
        <form
          onSubmit={handleSubmit}
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
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                value={form.organizer}
                onChange={(e) => setForm({ ...form, organizer: e.target.value })}
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
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
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
                Location
              </label>

              <input
                type="text"
                className="form-control"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
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
                value={form.prizePool}
                onChange={(e) => setForm({ ...form, prizePool: e.target.value })}
              />
            </div>
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
                Deadline *
              </label>

              <input
                type="date"
                className="form-control"
                value={form.registrationDeadline}
                onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                required
              />
            </div>

            <div
              className="col-md-4"
            >
              <label
                className="form-label fw-semibold small"
              >
                Start Date *
              </label>

              <input
                type="date"
                className="form-control"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
              />
            </div>

            <div
              className="col-md-4"
            >
              <label
                className="form-label fw-semibold small"
              >
                End Date *
              </label>

              <input
                type="date"
                className="form-control"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
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
                Tech Themes
              </label>

              <input
                type="text"
                className="form-control"
                value={form.technology}
                onChange={(e) => setForm({ ...form, technology: e.target.value })}
              />
            </div>

            <div
              className="col-md-6"
            >
              <label
                className="form-label fw-semibold small"
              >
                Registration URL *
              </label>

              <input
                type="url"
                className="form-control"
                value={form.officialUrl}
                onChange={(e) => setForm({ ...form, officialUrl: e.target.value })}
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
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary-custom fw-semibold"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminHackathons;
