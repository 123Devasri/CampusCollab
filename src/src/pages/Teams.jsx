import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import SkillGapCard from "../components/SkillGapCard";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("All");

  // Create Team modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [hackathonsList, setHackathonsList] = useState([]);
  const [teamForm, setTeamForm] = useState({
    name: "",
    description: "",
    hackathonId: "",
    hackathonName: "Smart India Hackathon",
    requiredSkills: "Frontend, Backend, Database, AI/ML",
    maxMembers: 4
  });
  const [creating, setCreating] = useState(false);

  // Request to join state
  const [joiningTeamId, setJoiningTeamId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const { isAuthenticated } = useAuth();

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await API.get("/teams", {
        params: {
          search: search || undefined,
          skill: skillFilter !== "All" ? skillFilter : undefined
        }
      });
      setTeams(res.data);
    } catch (err) {
      console.error("Teams fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHackathons = async () => {
    try {
      const res = await API.get("/hackathons");
      setHackathonsList(res.data);
      if (res.data.length > 0) {
        setTeamForm((prev) => ({
          ...prev,
          hackathonId: res.data[0]._id,
          hackathonName: res.data[0].name
        }));
      }
    } catch (err) {
      console.error("Hackathons load error:", err);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchHackathons();
  }, [skillFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTeams();
  };

  const handleCreateTeamSubmit = async (e) => {
    e.preventDefault();
    if (!teamForm.name.trim()) return;

    const skillsArr = teamForm.requiredSkills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      setCreating(true);
      await API.post("/teams", {
        name: teamForm.name,
        description: teamForm.description,
        hackathonId: teamForm.hackathonId || null,
        hackathonName: teamForm.hackathonName,
        requiredSkills: skillsArr,
        maxMembers: Number(teamForm.maxMembers) || 4
      });

      setShowCreateModal(false);
      setSuccessMsg(`Team '${teamForm.name}' created successfully.`);
      fetchTeams();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Create team error:", err);
      alert(err.response?.data?.message || "Failed to create team.");
    } finally {
      setCreating(false);
    }
  };

  const handleRequestJoin = async (teamId) => {
    if (!isAuthenticated) {
      alert("Please login to request to join a team.");
      return;
    }

    try {
      setJoiningTeamId(teamId);
      await API.post(`/teams/${teamId}/join`, {
        message: "Hi, I'd like to join your squad for the hackathon!"
      });
      setSuccessMsg("Join request submitted to the Team Admin.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Join request error:", err);
      alert(err.response?.data?.message || "Failed to submit join request.");
    } finally {
      setJoiningTeamId(null);
    }
  };

  return (
    <div
      className="teams-page py-4"
    >
      <div
        className="container"
      >
        {/* Header */}
        <div
          className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2"
        >
          <div>
            <h3
              className="fw-bold text-primary mb-1"
            >
              Hackathon Teams & Squads
            </h3>

            <p
              className="text-muted mb-0 small"
            >
              Browse active teams, analyze missing skills, or assemble your own squad.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary-custom fw-semibold shadow-sm"
          >
            Create New Team
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

        {/* Search & Filter */}
        <div
          className="card border shadow-sm rounded-3 p-3 bg-white mb-4"
        >
          <form
            onSubmit={handleSearchSubmit}
            className="row g-2 align-items-center"
          >
            <div
              className="col-md-7"
            >
              <input
                type="text"
                className="form-control"
                placeholder="Search teams by name, hackathon, or missing skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div
              className="col-md-3"
            >
              <select
                className="form-select"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
              >
                <option
                  value="All"
                >
                  All Skill Requirements
                </option>

                <option
                  value="Frontend"
                >
                  Needs Frontend
                </option>

                <option
                  value="Backend"
                >
                  Needs Backend
                </option>

                <option
                  value="Database"
                >
                  Needs Database
                </option>

                <option
                  value="AI/ML"
                >
                  Needs AI/ML
                </option>

                <option
                  value="UI/UX"
                >
                  Needs UI/UX
                </option>
              </select>
            </div>

            <div
              className="col-md-2"
            >
              <button
                type="submit"
                className="btn btn-primary-custom w-100 btn-sm fw-semibold"
              >
                Filter Teams
              </button>
            </div>
          </form>
        </div>

        {/* Teams List */}
        {loading ? (
          <LoadingState message="Loading hackathon teams..." />
        ) : teams.length > 0 ? (
          <div
            className="row g-4"
          >
            {teams.map((team) => (
              <div
                key={team._id}
                className="col-lg-6"
              >
                <div
                  className="card border shadow-sm rounded-3 p-4 bg-white h-100 d-flex flex-column custom-card"
                >
                  <div
                    className="d-flex justify-content-between align-items-start mb-2"
                  >
                    <div>
                      <span
                        className="badge bg-primary-subtle text-primary border small mb-1"
                      >
                        {team.hackathonName || team.hackathon?.name || "Hackathon"}
                      </span>

                      <h5
                        className="fw-bold text-primary mb-1 fs-5"
                      >
                        {team.name}
                      </h5>
                    </div>

                    <span
                      className="badge bg-light text-dark border fs-6"
                    >
                      {team.members?.length || 1}/{team.maxMembers || 4} Members
                    </span>
                  </div>

                  <p
                    className="text-muted small mb-2"
                  >
                    Admin: <strong>{team.createdBy?.name || "Student"}</strong> ({team.createdBy?.primaryRole})
                  </p>

                  {team.description && (
                    <p
                      className="text-secondary small mb-3 text-truncate-2"
                    >
                      {team.description}
                    </p>
                  )}

                  {/* Skill Gap Component */}
                  <SkillGapCard
                    skillGap={team.skillGap}
                    teamId={team._id}
                  />

                  <div
                    className="mt-auto pt-3 border-top d-flex gap-2"
                  >
                    <Link
                      to={`/teams/${team._id}`}
                      className="btn btn-outline-custom btn-sm flex-fill text-center"
                    >
                      View Team & Recommendations
                    </Link>

                    <button
                      onClick={() => handleRequestJoin(team._id)}
                      disabled={joiningTeamId === team._id || (team.members?.length || 0) >= (team.maxMembers || 4)}
                      className="btn btn-primary-custom btn-sm flex-fill"
                    >
                      {joiningTeamId === team._id
                        ? "Requesting..."
                        : (team.members?.length || 0) >= (team.maxMembers || 4)
                        ? "Team Full"
                        : "Request to Join"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Teams Found"
            message="No active teams match your search. Create the first team for your hackathon!"
            actionText="Create Team"
            onActionClick={() => setShowCreateModal(true)}
          />
        )}
      </div>

      {/* Create Team Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Hackathon Team"
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
              Target Hackathon
            </label>

            <select
              className="form-select"
              value={teamForm.hackathonId}
              onChange={(e) => {
                const selected = hackathonsList.find((h) => h._id === e.target.value);
                setTeamForm({
                  ...teamForm,
                  hackathonId: e.target.value,
                  hackathonName: selected ? selected.name : "Custom Hackathon"
                });
              }}
            >
              {hackathonsList.map((h) => (
                <option
                  key={h._id}
                  value={h._id}
                >
                  {h.name} ({h.mode})
                </option>
              ))}
            </select>
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
              placeholder="Describe your project idea or what problem you plan to solve..."
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
              The system will calculate skill gaps and recommend matching candidates.
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
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creating}
              className="btn btn-primary-custom fw-semibold"
            >
              {creating ? "Creating..." : "Create Team"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Teams;
