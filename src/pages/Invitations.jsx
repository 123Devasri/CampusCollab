import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";

function Invitations() {
  const [invitations, setInvitations] = useState({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("received"); // received or sent
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await API.get("/invitations");
      setInvitations(res.data);
    } catch (err) {
      console.error("Fetch invitations error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleRespond = async (invitationId, action) => {
    try {
      const res = await API.put(`/invitations/${invitationId}`, { action });
      setSuccessMsg(`Invitation ${action === "accepted" ? "accepted" : "declined"}.`);
      fetchInvitations();

      if (action === "accepted" && res.data.teamId) {
        navigate(`/teams/${res.data.teamId}`);
      }
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Respond error:", err);
      alert(err.response?.data?.message || "Failed to process response.");
    }
  };

  return (
    <div
      className="invitations-page py-4"
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
              Team Invitations
            </h3>

            <p
              className="text-muted mb-0 small"
            >
              Manage incoming invitations from squad leaders and track outgoing invites.
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

        {/* Tabs */}
        <ul
          className="nav nav-pills mb-4 bg-white p-2 rounded-3 shadow-sm border"
        >
          <li
            className="nav-item"
          >
            <button
              className={`nav-link ${activeTab === "received" ? "active" : ""}`}
              onClick={() => setActiveTab("received")}
            >
              Received Invitations ({invitations.received.length})
            </button>
          </li>

          <li
            className="nav-item"
          >
            <button
              className={`nav-link ${activeTab === "sent" ? "active" : ""}`}
              onClick={() => setActiveTab("sent")}
            >
              Sent Invitations ({invitations.sent.length})
            </button>
          </li>
        </ul>

        {/* Tab 1: Received */}
        {activeTab === "received" && (
          <div>
            {loading ? (
              <LoadingState message="Loading your invitations..." />
            ) : invitations.received.length > 0 ? (
              <div
                className="row g-3"
              >
                {invitations.received.map((inv) => (
                  <div
                    key={inv._id}
                    className="col-md-6"
                  >
                    <div
                      className="card border shadow-sm rounded-3 p-4 bg-white h-100 d-flex flex-column"
                    >
                      <div
                        className="d-flex justify-content-between align-items-start mb-2"
                      >
                        <h6
                          className="fw-bold text-primary mb-1 fs-5"
                        >
                          {inv.team?.name || "Hackathon Team"}
                        </h6>

                        <span
                          className={`badge ${
                            inv.status === "accepted"
                              ? "bg-success"
                              : inv.status === "rejected"
                              ? "bg-danger"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>

                      <p
                        className="text-muted small mb-2"
                      >
                        {inv.team?.hackathonName || "Hackathon Event"} • Invited by <strong>{inv.invitedBy?.name}</strong>
                      </p>

                      <div
                        className="p-2 bg-light rounded border small text-secondary mb-3"
                      >
                        "{inv.message || "We would love to have you on our team!"}"
                      </div>

                      <div
                        className="mt-auto pt-3 border-top d-flex gap-2"
                      >
                        {inv.status === "pending" ? (
                          <>
                            <button
                              onClick={() => handleRespond(inv._id, "accepted")}
                              className="btn btn-success btn-sm flex-fill fw-semibold"
                            >
                              Accept & Join Team
                            </button>

                            <button
                              onClick={() => handleRespond(inv._id, "rejected")}
                              className="btn btn-outline-secondary btn-sm flex-fill"
                            >
                              Decline
                            </button>
                          </>
                        ) : (
                          <Link
                            to={`/teams/${inv.team?._id}`}
                            className="btn btn-outline-primary btn-sm w-100 text-center"
                          >
                            View Team Workspace
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Received Invitations"
                message="You don't have any incoming team invitations right now."
                actionText="Explore Teams"
                actionLink="/teams"
              />
            )}
          </div>
        )}

        {/* Tab 2: Sent */}
        {activeTab === "sent" && (
          <div>
            {invitations.sent.length > 0 ? (
              <div
                className="row g-3"
              >
                {invitations.sent.map((inv) => (
                  <div
                    key={inv._id}
                    className="col-md-6"
                  >
                    <div
                      className="card border shadow-sm rounded-3 p-4 bg-white h-100"
                    >
                      <div
                        className="d-flex justify-content-between align-items-start mb-2"
                      >
                        <div>
                          <h6
                            className="fw-bold text-primary mb-1"
                          >
                            Invited: {inv.invitedUser?.name}
                          </h6>

                          <p
                            className="text-muted small mb-0"
                          >
                            For Team: <strong>{inv.team?.name}</strong>
                          </p>
                        </div>

                        <span
                          className={`badge ${
                            inv.status === "accepted"
                              ? "bg-success"
                              : inv.status === "rejected"
                              ? "bg-danger"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>

                      <div
                        className="d-flex flex-wrap gap-1 mt-2"
                      >
                        {(inv.invitedUser?.skills || []).map((s, idx) => (
                          <span
                            key={idx}
                            className="badge bg-light text-dark border small"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Sent Invitations"
                message="You haven't sent any invitations to other students yet."
                actionText="Find Teammates to Invite"
                actionLink="/teammates"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Invitations;
