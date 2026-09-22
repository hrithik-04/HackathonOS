import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

function TeamRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // =========================
  // LOAD INCOMING REQUESTS
  // =========================

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const savedUser = localStorage.getItem("user");

        if (!savedUser) {
          navigate("/login");
          return;
        }

        const user = JSON.parse(savedUser);
        const userId = user.id || user._id;

        if (!userId) {
          setLoading(false);
          return;
        }

        const response = await apiFetch(
          `/api/team-requests/incoming/${userId}`
        );

        const data = await response.json();

        console.log("INCOMING REQUESTS RESPONSE:", data);

        if (data.success) {
          setRequests(
            Array.isArray(data.requests) ? data.requests : []
          );
        } else {
          alert(data.message || "Could not load requests.");
        }
      } catch (error) {
        console.error("Team requests error:", error);
        alert("Could not connect to backend.");
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [navigate]);

  // =========================
  // ACCEPT / REJECT
  // =========================

  const handleRequest = async (requestId, status) => {
    try {
      setProcessingId(requestId);

      const response = await apiFetch(
        `/api/team-requests/${requestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      console.log("REQUEST UPDATE RESPONSE:", data);

      if (!response.ok || !data.success) {
        alert(data.message || "Could not update request.");
        return;
      }

      // Remove processed request
      setRequests((prevRequests) =>
        prevRequests.filter(
          (request) => request._id !== requestId
        )
      );

      if (status === "accepted") {
        alert("Request accepted! Team created successfully. 🎉");
      } else {
        alert("Request rejected.");
      }
    } catch (error) {
      console.error("Request update error:", error);
      alert("Could not connect to backend.");
    } finally {
      setProcessingId(null);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="team-requests-page">
        <div className="team-requests-loading">
          <div className="request-loading-icon">🤝</div>
          <h2>Loading team requests...</h2>
          <p>Please wait a moment.</p>
        </div>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="team-requests-page">

      {/* HEADER */}

      <div className="team-requests-header">

        <button
          className="team-requests-back"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

        <h1>Team Requests</h1>

        <p>
          Review students who want to collaborate with you.
        </p>

      </div>

      {/* EMPTY STATE */}

      {requests.length === 0 ? (

        <div className="team-requests-empty">

          <div className="team-requests-empty-icon">
            🤝
          </div>

          <h2>No Pending Requests</h2>

          <p>
            You don't have any incoming team requests right now.
          </p>

          <button
            onClick={() => navigate("/teammates")}
          >
            Find Teammates →
          </button>

        </div>

      ) : (

        <div className="team-requests-list">

          {requests.map((request) => {

            const sender = request.sender;

            const isProcessing =
              processingId === request._id;

            return (

              <div
                className="team-request-card"
                key={request._id}
              >

                {/* PROFILE PHOTO */}

                <div className="team-request-avatar">

                  {sender?.profilePhoto ? (

                    <img
                      src={sender.profilePhoto}
                      alt={sender.name || "User"}
                      className="team-request-profile-photo"
                    />

                  ) : (

                    sender?.name
                      ? sender.name.charAt(0).toUpperCase()
                      : "U"

                  )}

                </div>


                {/* USER INFO */}

                <div className="team-request-info">

                  <h2>
                    {sender?.name || "Unknown User"}
                  </h2>

                  <p>
                    {sender?.college || "College not added"}
                  </p>

                  {(sender?.branch || sender?.year) && (

                    <span className="team-request-academic">

                      {sender?.branch || "Branch not added"}

                      {sender?.year &&
                        ` • Year ${sender.year}`}

                    </span>

                  )}


                  {/* BIO */}

                  {sender?.bio && (

                    <p className="team-request-bio">
                      {sender.bio}
                    </p>

                  )}


                  {/* SKILLS */}

                  {sender?.skills?.length > 0 && (

                    <div className="team-request-skills">

                      {sender.skills.slice(0, 6).map(
                        (skill, index) => (

                          <span key={index}>
                            {skill}
                          </span>

                        )
                      )}

                    </div>

                  )}


                  {/* PROFILE LINKS */}

                  {(sender?.github || sender?.linkedin) && (

                    <div className="team-request-links">

                      {sender?.github && (
                        <a
                          href={sender.github}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          GitHub ↗
                        </a>
                      )}

                      {sender?.linkedin && (
                        <a
                          href={sender.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          LinkedIn ↗
                        </a>
                      )}

                    </div>

                  )}

                </div>


                {/* ACTIONS */}

                <div className="team-request-actions">

                  <button
                    className="view-request-profile"
                    onClick={() =>
                      navigate(`/teammate/${sender?._id}`)
                    }
                    disabled={!sender?._id || isProcessing}
                  >
                    View Profile
                  </button>

                  <button
                    className="accept-request"
                    disabled={isProcessing}
                    onClick={() =>
                      handleRequest(
                        request._id,
                        "accepted"
                      )
                    }
                  >
                    {isProcessing
                      ? "Processing..."
                      : "Accept"}
                  </button>

                  <button
                    className="reject-request"
                    disabled={isProcessing}
                    onClick={() =>
                      handleRequest(
                        request._id,
                        "rejected"
                      )
                    }
                  >
                    Reject
                  </button>

                </div>

              </div>

            );
          })}

        </div>

      )}

    </div>
  );
}

export default TeamRequests;
