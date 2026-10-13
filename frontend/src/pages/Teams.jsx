import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../services/api";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import SkillGapCard from "../components/SkillGapCard";
import TeammateCard from "../components/TeammateCard";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

function Teams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "teammates" ? "teammates" : "teams";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Teams state
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [teamSearch, setTeamSearch] = useState("");
  const [teamSkillFilter, setTeamSkillFilter] = useState("All");

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
  const [joiningTeamId, setJoiningTeamId] = useState(null);

  // Teammates state
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [studentSearch, setStudentSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [studentSkillFilter, setStudentSkillFilter] = useState("All");

  // Invite teammate modal state
  const [invitingStudent, setInvitingStudent] = useState(null);
  const [myTeams, setMyTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const { user, isAuthenticated } = useAuth();

  // Fetch teams
  const fetchTeams = async () => {
    try {
      setLoadingTeams(true);
      const res = await API.get("/teams", {
        params: {
          search: teamSearch || undefined,
          skill: teamSkillFilter !== "All" ? teamSkillFilter : undefined
        }
      });
      setTeams(res.data);
    } catch (err) {
      console.error("Teams fetch error:", err);
    } finally {
      setLoadingTeams(false);
    }
  };

  // Fetch hackathons for creation dropdown
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

  // Fetch students for teammates subtab
  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const res = await API.get("/teammates", {
        params: {
          search: studentSearch.trim() || undefined,
          role: roleFilter !== "All" ? roleFilter : undefined,
          skill: studentSkillFilter !== "All" ? studentSkillFilter : undefined
        }
      });
      setStudents(res.data);
    } catch (err) {
      console.error("Fetch teammates error:", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Fetch user squads for invite modal
  const fetchUserTeams = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await API.get("/profile");
      const uTeams = res.data.teams || [];
      setMyTeams(uTeams);
      if (uTeams.length > 0) {
        setSelectedTeamId(uTeams[0]._id);
      }
    } catch (err) {
      console.error("Fetch user teams error:", err);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchHackathons();
  }, [teamSkillFilter]);

  useEffect(() => {
    fetchStudents();
  }, [roleFilter, studentSkillFilter]);

  useEffect(() => {
    fetchUserTeams();
  }, [isAuthenticated]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === "teammates" ? { tab: "teammates" } : {});
  };

  const handleTeamSearchSubmit = (e) => {
    e.preventDefault();
    fetchTeams();
  };

  const handleStudentSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
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
      fetchUserTeams();
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

  const handleOpenInvite = (student) => {
    if (!isAuthenticated) return;
    if (myTeams.length === 0) {
      alert("You need to create a squad first. Click '+ Create New Squad' to assemble your team!");
      return;
    }
    setInvitingStudent(student);
    setInviteMessage(`Hi ${student.name}, please join our hackathon squad!`);
  };

  const handleSendInviteSubmit = async (e) => {
    e.preventDefault();
    if (!invitingStudent || !selectedTeamId) return;

    try {
      setSendingInvite(true);
      await API.post(`/teams/${selectedTeamId}/invite`, {
        userId: invitingStudent._id,
        message: inviteMessage
      });
      setSuccessMsg(`Invitation sent to ${invitingStudent.name}.`);
      setInvitingStudent(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Invite error:", err);
      alert(err.response?.data?.message || "Failed to send invitation.");
    } finally {
      setSendingInvite(false);
    }
  };

  // Exclude current student from recruitment search
  const currentUserId = user?.id || user?._id;
  const filteredStudents = students.filter((s) => {
    if (!currentUserId && !user?.email) return true;
    const isSelf =
      String(s._id) === String(currentUserId) ||
      (user?.email && s.email?.toLowerCase() === user?.email?.toLowerCase());
    return !isSelf;
  });

  return (
    <div className="teams-page py-4">
      <div className="container">
        {/* Unified Tab Pill Switcher */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div className="d-flex bg-white p-1 rounded-3 border shadow-sm gap-1">
            <button
              onClick={() => handleTabSwitch("teams")}
              className={`btn btn-sm px-4 fw-semibold rounded-2 transition-all ${
                activeTab === "teams"
                  ? "btn-primary-custom"
                  : "btn-outline-custom border-0 text-muted"
              }`}
            >
              Hackathon Squads ({teams.length})
            </button>
            <button
              onClick={() => handleTabSwitch("teammates")}
              className={`btn btn-sm px-4 fw-semibold rounded-2 transition-all ${
                activeTab === "teammates"
                  ? "btn-primary-custom"
                  : "btn-outline-custom border-0 text-muted"
              }`}
            >
              Find Teammates ({filteredStudents.length})
            </button>
          </div>

          <div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary-custom fw-semibold shadow-sm"
            >
              Create New Squad
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="alert alert-success py-2 alert-dismissible fade show mb-4" role="alert">
            {successMsg}
          </div>
        )}

        {/* SUBTAB 1: SQUADS & TEAMS */}
        {activeTab === "teams" && (
          <div>
            {/* Search & Filter */}
            <div className="card border shadow-sm rounded-3 p-3 bg-white mb-4">
              <form onSubmit={handleTeamSearchSubmit} className="row g-2 align-items-center">
                <div className="col-md-7">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search squads by name, hackathon, or missing skill..."
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={teamSkillFilter}
                    onChange={(e) => setTeamSkillFilter(e.target.value)}
                  >
                    <option value="All">All Skill Requirements</option>
                    <option value="Frontend">Needs Frontend</option>
                    <option value="Backend">Needs Backend</option>
                    <option value="Database">Needs Database</option>
                    <option value="AI/ML">Needs AI/ML</option>
                    <option value="UI/UX">Needs UI/UX</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <button type="submit" className="btn btn-primary-custom w-100 btn-sm fw-semibold">
                    Filter Squads
                  </button>
                </div>
              </form>
            </div>

            {/* Teams Grid */}
            {loadingTeams ? (
              <LoadingState message="Loading hackathon squads..." />
            ) : teams.length > 0 ? (
              <div className="row g-4">
                {teams.map((team) => {
                  const isOwner = Boolean(
                    currentUserId &&
                      String(team.createdBy?._id || team.createdBy) === String(currentUserId)
                  );
                  const isMember = Boolean(
                    currentUserId &&
                      (isOwner ||
                        team.members?.some(
                          (m) => String(m.user?._id || m.user) === String(currentUserId)
                        ))
                  );

                  return (
                    <div key={team._id} className="col-lg-6">
                      <div className="card border shadow-sm rounded-3 p-4 bg-white h-100 d-flex flex-column custom-card">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <span className="badge bg-primary-subtle text-primary border small mb-1">
                              {team.hackathonName || team.hackathon?.name || "Hackathon"}
                            </span>
                            <h5 className="fw-bold text-primary mb-1 fs-5">{team.name}</h5>
                          </div>

                          <div className="d-flex align-items-center gap-2">
                            {isOwner && (
                              <span className="badge bg-primary text-white border small">
                                Squad Leader
                              </span>
                            )}
                            <span className="badge bg-light text-dark border fs-6">
                              {team.members?.length || 1}/{team.maxMembers || 4} Members
                            </span>
                          </div>
                        </div>

                        <p className="text-muted small mb-2">
                          Admin: <strong>{team.createdBy?.name || "Student"}</strong> ({team.createdBy?.primaryRole})
                        </p>

                        {team.description && (
                          <p className="text-secondary small mb-3 text-truncate-2">
                            {team.description}
                          </p>
                        )}

                        <SkillGapCard skillGap={team.skillGap} teamId={team._id} />

                        <div className="mt-auto pt-3 border-top d-flex gap-2 align-items-center">
                          <Link
                            to={`/teams/${team._id}`}
                            className="btn btn-outline-custom btn-sm flex-fill text-center"
                          >
                            {isOwner ? "Manage Squad & Matches" : "View Squad Details"}
                          </Link>

                          {!isOwner && !isMember && (
                            <button
                              onClick={() => handleRequestJoin(team._id)}
                              disabled={
                                joiningTeamId === team._id ||
                                (team.members?.length || 0) >= (team.maxMembers || 4)
                              }
                              className="btn btn-primary-custom btn-sm flex-fill"
                            >
                              {joiningTeamId === team._id
                                ? "Requesting..."
                                : (team.members?.length || 0) >= (team.maxMembers || 4)
                                ? "Team Full"
                                : "Request to Join"}
                            </button>
                          )}

                          {isMember && !isOwner && (
                            <span className="badge bg-success-subtle text-success border px-3 py-2">
                              Joined Member
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No Squads Found"
                message="No active squads match your search. Create the first squad for your hackathon!"
                actionText="+ Create Squad"
                onActionClick={() => setShowCreateModal(true)}
              />
            )}
          </div>
        )}

        {/* SUBTAB 2: FIND TEAMMATES */}
        {activeTab === "teammates" && (
          <div>
            {/* Search & Filter */}
            <div className="card border shadow-sm rounded-3 p-3 bg-white mb-4">
              <form onSubmit={handleStudentSearchSubmit} className="row g-2 align-items-center">
                <div className="col-md-5">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by student name, college, skills, or role..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="All">All Roles</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="ML Developer">ML Developer</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="Database Developer">Database Developer</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={studentSkillFilter}
                    onChange={(e) => setStudentSkillFilter(e.target.value)}
                  >
                    <option value="All">All Tech</option>
                    <option value="React">React</option>
                    <option value="Node.js">Node.js</option>
                    <option value="Python">Python</option>
                    <option value="MongoDB">MongoDB</option>
                    <option value="MySQL">MySQL</option>
                    <option value="TensorFlow">TensorFlow</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <button type="submit" className="btn btn-primary-custom w-100 btn-sm fw-semibold">
                    Filter Peers
                  </button>
                </div>
              </form>
            </div>

            {/* Students Grid */}
            {loadingStudents ? (
              <LoadingState message="Searching student developers..." />
            ) : filteredStudents.length > 0 ? (
              <div className="row g-4">
                {filteredStudents.map((student) => (
                  <div key={student._id} className="col-md-6 col-lg-4">
                    <TeammateCard student={student} onInvite={handleOpenInvite} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Students Found"
                message="No other registered students match your search criteria. Try adjusting your keywords."
                actionText="Clear Filters"
                onActionClick={() => {
                  setStudentSearch("");
                  setRoleFilter("All");
                  setStudentSkillFilter("All");
                  fetchStudents();
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Hackathon Squad"
      >
        <form onSubmit={handleCreateTeamSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Squad Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Code Warriors"
              value={teamForm.name}
              onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small">Target Hackathon</label>
            <select
              className="form-select"
              value={teamForm.hackathonId}
              onChange={(e) => {
                const selected = hackathonsList.find((h) => h._id === e.target.value);
                setTeamForm({
                  ...teamForm,
                  hackathonId: e.target.value,
                  hackathonName: selected ? selected.name : "Smart India Hackathon"
                });
              }}
            >
              {hackathonsList.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name} ({h.mode})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small">Squad Objective / Goal</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Describe what your squad is aiming to build..."
              value={teamForm.description}
              onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small">Required Skills (comma separated)</label>
            <input
              type="text"
              className="form-control"
              value={teamForm.requiredSkills}
              onChange={(e) => setTeamForm({ ...teamForm, requiredSkills: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small">Max Squad Members</label>
            <input
              type="number"
              min="2"
              max="6"
              className="form-control"
              value={teamForm.maxMembers}
              onChange={(e) => setTeamForm({ ...teamForm, maxMembers: e.target.value })}
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="btn btn-primary-custom btn-sm fw-semibold"
            >
              {creating ? "Creating..." : "Create Squad"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Invite Teammate Modal */}
      <Modal
        isOpen={!!invitingStudent}
        onClose={() => setInvitingStudent(null)}
        title={`Invite ${invitingStudent?.name} to Your Squad`}
      >
        <form onSubmit={handleSendInviteSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Select Your Squad *</label>
            <select
              className="form-select"
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              required
            >
              {myTeams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.hackathonName || t.hackathon?.name})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small">Invitation Message</label>
            <textarea
              className="form-control"
              rows="3"
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setInvitingStudent(null)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sendingInvite}
              className="btn btn-primary-custom btn-sm fw-semibold"
            >
              {sendingInvite ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Teams;
