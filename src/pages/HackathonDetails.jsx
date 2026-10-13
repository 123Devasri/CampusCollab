import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import API from "../services/api";
import LoadingState from "../components/LoadingState";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

function HackathonDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create Team modal state
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamForm, setTeamForm] = useState({
    name: "",
    description: "",
    requiredSkills: "Frontend, Backend, Database, AI/ML",
    maxMembers: 4
  });
  const [creatingTeam, setCreatingTeam] = useState(false);

  // External Redirect Modal state
  const [showRedirectModal, setShowRedirectModal] = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/hackathons/${id}`);
      setData(res.data);

      if (searchParams.get("createTeam") === "true") {
        setShowTeamModal(true);
      }
    } catch (err) {
      console.error("Hackathon details error:", err);
      setError("Failed to load hackathon details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleCreateTeamSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!teamForm.name.trim()) {
      alert("Please provide a team name.");
      return;
    }

    const skillsArr = teamForm.requiredSkills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      setCreatingTeam(true);
      const res = await API.post("/teams", {
        name: teamForm.name,
        description: teamForm.description,
        hackathonId: id,
        hackathonName: data.hackathon?.name,
        requiredSkills: skillsArr,
        maxMembers: Number(teamForm.maxMembers) || 4
      });

      setShowTeamModal(false);
      navigate(`/teams/${res.data.team?._id}`);
    } catch (err) {
      console.error("Create team error:", err);
      alert(err.response?.data?.message || "Failed to create team.");
    } finally {
      setCreatingTeam(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading hackathon information..." />;
  }

  if (error || !data) {
    return (
      <div
        className="container py-5 text-center"
      >
        <div
          className="alert alert-danger"
        >
          {error || "Hackathon not found."}
        </div>

        <Link
          to="/hackathons"
          className="btn btn-primary-custom"
        >
          Back to Hackathons
        </Link>
      </div>
    );
  }

  const { hackathon, teams } = data;

  return (
    <div
      className="hackathon-details-page py-4"
    >
      <div
        className="container"
      >
        {/* Main Details Banner */}
        <div
          className="card border shadow-sm rounded-3 p-4 bg-white mb-4"
        >
          <div
            className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3"
          >
            <div>
              <span
                className="badge bg-primary px-3 py-1 mb-2 fs-6"
              >
                {hackathon.mode} Mode
              </span>

              <h2
                className="fw-bold text-primary mb-1"
              >
                {hackathon.name}
              </h2>

              <p
                className="text-muted fs-6 mb-0"
              >
                Organized by <strong>{hackathon.organizer}</strong>
              </p>
            </div>

            <div
              className="d-flex gap-2 flex-wrap"
            >
              <button
                onClick={() => setShowTeamModal(true)}
                className="btn btn-primary-custom fw-semibold shadow-sm"
              >
                Create Team
              </button>

              <button
                onClick={() => setShowRedirectModal(true)}
                className="btn btn-success fw-semibold shadow-sm"
              >
                Register on Official Website ↗
              </button>
            </div>
          </div>

          <hr />

          <div
            className="row g-3 my-2"
          >
            <div
              className="col-md-3"
            >
              <div
                className="p-3 bg-light rounded border text-center"
              >
                <div
                  className="text-muted small"
                >
                  Registration Deadline
                </div>

                <div
                  className="fw-bold text-dark fs-6 mt-1"
                >
                  {hackathon.registrationDeadline}
                </div>
              </div>
            </div>

            <div
              className="col-md-3"
            >
              <div
                className="p-3 bg-light rounded border text-center"
              >
                <div
                  className="text-muted small"
                >
                  Event Dates
                </div>

                <div
                  className="fw-bold text-dark fs-6 mt-1"
                >
                  {hackathon.startDate} - {hackathon.endDate}
                </div>
              </div>
            </div>

            <div
              className="col-md-3"
            >
              <div
                className="p-3 bg-light rounded border text-center"
              >
                <div
                  className="text-muted small"
                >
                  Location / Venue
                </div>

                <div
                  className="fw-bold text-dark fs-6 mt-1"
                >
                  {hackathon.location}
                </div>
              </div>
            </div>

            <div
              className="col-md-3"
            >
              <div
                className="p-3 bg-light rounded border text-center"
              >
                <div
                  className="text-muted small"
                >
                  Prize Pool
                </div>

                <div
                  className="fw-bold text-success fs-6 mt-1"
                >
                  {hackathon.prizePool}
                </div>
              </div>
            </div>
          </div>

          <div
            className="mt-4"
          >
            <h5
              className="fw-bold text-dark mb-2 fs-5"
            >
              About the Hackathon
            </h5>

            <p
              className="text-secondary leading-relaxed"
            >
              {hackathon.description}
            </p>
          </div>

          <div
            className="mt-3"
          >
            <h6
              className="fw-bold text-dark mb-1"
            >
              Target Technologies:
            </h6>

            <p
              className="text-muted small"
            >
              {hackathon.technology}
            </p>
          </div>

          <div
            className="mt-2"
          >
            <h6
              className="fw-bold text-dark mb-1"
            >
              Eligibility:
            </h6>

            <p
              className="text-muted small"
            >
              {hackathon.eligibility}
            </p>
          </div>
        </div>

        {/* Existing Teams for this Hackathon */}
        <div
          className="card border shadow-sm rounded-3 p-4 bg-white"
        >
          <div
            className="d-flex justify-content-between align-items-center mb-3"
          >
            <div>
              <h5
                className="fw-bold text-primary mb-1 fs-5"
              >
                Registered Teams ({teams.length})
              </h5>

              <p
                className="text-muted small mb-0"
              >
                Browse student squads looking for members or collaborate with existing teams.
              </p>
            </div>

            <Link
              to="/teammates"
              className="btn btn-outline-primary btn-sm"
            >
              Find Teammates
            </Link>
          </div>

          {teams.length > 0 ? (
            <div
              className="row g-3"
            >
              {teams.map((t) => (
                <div
                  key={t._id}
                  className="col-md-6"
                >
                  <div
                    className="p-3 bg-light rounded border h-100 d-flex flex-column"
                  >
                    <div
                      className="d-flex justify-content-between align-items-start mb-2"
                    >
                      <h6
                        className="fw-bold text-primary mb-0 fs-5"
                      >
                        {t.name}
                      </h6>

                      <span
                        className="badge bg-primary-subtle text-primary border"
                      >
                        {t.members?.length || 1}/{t.maxMembers || 4} Members
                      </span>
                    </div>

                    <p
                      className="text-muted small mb-2"
                    >
                      Admin: {t.createdBy?.name || "Student"}
                    </p>

                    {t.description && (
                      <p
                        className="small text-secondary mb-3 text-truncate-2"
                      >
                        {t.description}
                      </p>
                    )}

                    <div
                      className="mt-auto d-flex justify-content-between align-items-center pt-2 border-top"
                    >
                      <span
                        className="text-muted small"
                      >
                        Needs: {(t.requiredSkills || []).slice(0, 3).join(", ")}
                      </span>

                      <Link
                        to={`/teams/${t._id}`}
                        className="btn btn-outline-custom btn-sm"
                      >
                        View Team
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-4 text-muted small"
            >
              No teams created for this hackathon yet. Be the first to start a team!
            </div>
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      <Modal
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        title={`Create Team for ${hackathon.name}`}
      >
        <form
          onSubmit={handleCreateTeamSubmit}
        >
          <div
            className="mb-3"
          >
            <label
              className="form-label fw-semibold small"
            >
              Team Name *
            </label>

            <input
              type="text"
              className="form-control"
              placeholder="e.g. Code Warriors"
              value={teamForm.name}
              onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
              required
            />
          </div>

          <div
            className="mb-3"
          >
            <label
              className="form-label fw-semibold small"
            >
              Team Goal / Description
            </label>

            <textarea
              className="form-control"
              rows="3"
              placeholder="What are you aiming to build for this hackathon?"
              value={teamForm.description}
              onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
            >
            </textarea>
          </div>

          <div
            className="mb-3"
          >
            <label
              className="form-label fw-semibold small"
            >
              Required Team Skills (comma separated) *
            </label>

            <input
              type="text"
              className="form-control"
              placeholder="Frontend, Backend, Database, AI/ML"
              value={teamForm.requiredSkills}
              onChange={(e) => setTeamForm({ ...teamForm, requiredSkills: e.target.value })}
              required
            />

            <div
              className="form-text"
            >
              CampusCollab will calculate skill coverage against these requirements.
            </div>
          </div>

          <div
            className="mb-4"
          >
            <label
              className="form-label fw-semibold small"
            >
              Maximum Members
            </label>

            <input
              type="number"
              min="2"
              max="6"
              className="form-control"
              value={teamForm.maxMembers}
              onChange={(e) => setTeamForm({ ...teamForm, maxMembers: e.target.value })}
            />
          </div>

          <div
            className="d-flex justify-content-end gap-2"
          >
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowTeamModal(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creatingTeam}
              className="btn btn-primary-custom fw-semibold"
            >
              {creatingTeam ? "Creating..." : "Create Team"}
            </button>
          </div>
        </form>
      </Modal>

      {/* External Registration Disclaimer Modal */}
      <Modal
        isOpen={showRedirectModal}
        onClose={() => setShowRedirectModal(false)}
        title="Official Hackathon Registration"
      >
        <div
          className="text-center py-3"
        >
          <h5
            className="fw-bold mb-2 text-dark"
          >
            External Organizer Redirection
          </h5>

          <p
            className="text-muted mb-4 mx-auto"
            style={{ maxWidth: "480px" }}
          >
            You are being redirected to <strong>{hackathon.name}</strong>'s official portal at:
            <br />
            <code
              className="d-inline-block mt-2 text-break"
            >
              {hackathon.officialUrl}
            </code>
          </p>

          <div
            className="alert alert-warning small text-start mb-4"
          >
            <strong>Note:</strong> Official registration must be completed on the organizer's portal.
          </div>

          <div
            className="d-flex justify-content-center gap-2"
          >
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowRedirectModal(false)}
            >
              Cancel
            </button>

            <a
              href={hackathon.officialUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => setShowRedirectModal(false)}
              className="btn btn-success fw-semibold"
            >
              Continue to Registration ↗
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default HackathonDetails;
