import React, { useEffect, useState } from "react";
import API from "../services/api";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import TeammateCard from "../components/TeammateCard";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Teammates() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [skillFilter, setSkillFilter] = useState("All");

  // Invite modal state
  const [invitingStudent, setInvitingStudent] = useState(null);
  const [myTeams, setMyTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/teammates", {
        params: {
          search: search.trim() || undefined,
          role: roleFilter !== "All" ? roleFilter : undefined,
          skill: skillFilter !== "All" ? skillFilter : undefined
        }
      });
      setStudents(res.data);
    } catch (err) {
      console.error("Fetch teammates error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTeams = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await API.get("/profile");
      const userTeams = res.data.teams || [];
      setMyTeams(userTeams);
      if (userTeams.length > 0) {
        setSelectedTeamId(userTeams[0]._id);
      }
    } catch (err) {
      console.error("Fetch user teams error:", err);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(delaySearch);
  }, [search, roleFilter, skillFilter]);

  useEffect(() => {
    fetchUserTeams();
  }, [isAuthenticated]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleOpenInvite = (student) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (myTeams.length === 0) {
      alert("You need to create a squad first. Please go to Hackathons or Teams to create a squad!");
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

  return (
    <div
      className="teammates-page py-4"
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
              Teammate Discovery
            </h3>

            <p
              className="text-muted mb-0 small"
            >
              Discover student developers, check complementary skill sets, view contact details, and invite them to your squad.
            </p>
          </div>
        </div>

        {successMsg && (
          <div
            className="alert alert-success py-2 alert-dismissible fade show"
            role="alert"
          >
            {successMsg}
          </div>
        )}

        {/* Real-time Search & Filter Controls */}
        <div
          className="card border shadow-sm rounded-3 p-3 bg-white mb-4"
        >
          <form
            onSubmit={handleSearchSubmit}
            className="row g-2 align-items-center"
          >
            <div
              className="col-md-5"
            >
              <input
                type="text"
                className="form-control"
                placeholder="Type student name, college, skills, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div
              className="col-md-3"
            >
              <select
                className="form-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option
                  value="All"
                >
                  All Roles
                </option>

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

            <div
              className="col-md-2"
            >
              <select
                className="form-select"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
              >
                <option
                  value="All"
                >
                  All Tech
                </option>

                <option
                  value="React"
                >
                  React
                </option>

                <option
                  value="Node.js"
                >
                  Node.js
                </option>

                <option
                  value="Python"
                >
                  Python
                </option>

                <option
                  value="MongoDB"
                >
                  MongoDB
                </option>

                <option
                  value="MySQL"
                >
                  MySQL
                </option>

                <option
                  value="TensorFlow"
                >
                  TensorFlow
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
                Filter
              </button>
            </div>
          </form>
        </div>

        {/* Student Cards Grid */}
        {loading ? (
          <LoadingState message="Searching student developers..." />
        ) : students.length > 0 ? (
          <div
            className="row g-4"
          >
            {students.map((student) => (
              <div
                key={student._id}
                className="col-md-6 col-lg-4"
              >
                <TeammateCard
                  student={student}
                  onInvite={handleOpenInvite}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Students Found"
            message="No registered students match your search criteria. Try adjusting your keywords."
            actionText="Clear Filters"
            onActionClick={() => {
              setSearch("");
              setRoleFilter("All");
              setSkillFilter("All");
              fetchStudents();
            }}
          />
        )}
      </div>

      {/* Add / Invite to Team Modal */}
      <Modal
        isOpen={!!invitingStudent}
        onClose={() => setInvitingStudent(null)}
        title={`Add ${invitingStudent?.name} to Your Team`}
      >
        <form
          onSubmit={handleSendInviteSubmit}
        >
          <div
            className="mb-3"
          >
            <label
              className="form-label fw-semibold small"
            >
              Select Your Squad *
            </label>

            <select
              className="form-select"
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              required
            >
              {myTeams.map((t) => (
                <option
                  key={t._id}
                  value={t._id}
                >
                  {t.name} ({t.hackathonName || t.hackathon?.name})
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
              Teammate Contact Email
            </label>

            <input
              type="text"
              className="form-control bg-light"
              value={invitingStudent?.email || ""}
              readOnly
            />
          </div>

          <div
            className="mb-3"
          >
            <label
              className="form-label fw-semibold small"
            >
              Invitation Message
            </label>

            <textarea
              className="form-control"
              rows="3"
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              required
            >
            </textarea>
          </div>

          <div
            className="d-flex justify-content-end gap-2"
          >
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setInvitingStudent(null)}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={sendingInvite}
              className="btn btn-primary-custom fw-semibold"
            >
              {sendingInvite ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Teammates;
