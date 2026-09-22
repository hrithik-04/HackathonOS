import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

function MyApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
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

        // =========================
        // LOAD ALL USERS
        // =========================

        try {
          const usersResponse = await apiFetch(
            "/api/users"
          );

          const usersData = await usersResponse.json();

          if (usersData.success && Array.isArray(usersData.users)) {
            setUsers(usersData.users);
          }
        } catch (error) {
          console.error("Users loading error:", error);
        }

        // =========================
        // HACKATHON APPLICATIONS
        // =========================

        const applicationsResponse = await apiFetch(
          `/api/applications/${userId}`
        );

        const applicationsData =
          await applicationsResponse.json();

        if (applicationsData.success) {
          setApplications(
            Array.isArray(applicationsData.applications)
              ? applicationsData.applications
              : []
          );
        }

        // =========================
        // SENT TEAM REQUESTS
        // =========================

        const requestsResponse = await apiFetch(
          `/api/team-requests/sent/${userId}`
        );

        const requestsData = await requestsResponse.json();

        console.log("SENT REQUESTS RESPONSE:", requestsData);

        if (requestsData.success) {
          setRequests(
            Array.isArray(requestsData.requests)
              ? requestsData.requests
              : []
          );
        }

      } catch (error) {
        console.error(
          "My Applications loading error:",
          error
        );

        alert("Could not connect to backend.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // =========================
  // GET RECEIVER DETAILS
  // =========================

  function getReceiver(request) {
    // If backend already populated receiver
    if (
      request?.receiver &&
      typeof request.receiver === "object"
    ) {
      return request.receiver;
    }

    // If receiver is only an ID
    const receiverId =
      typeof request?.receiver === "string"
        ? request.receiver
        : request?.receiver?._id;

    if (!receiverId) {
      return null;
    }

    // Find receiver from users list
    return (
      users.find(
        (user) =>
          String(user._id) === String(receiverId)
      ) || null
    );
  }

  // =========================
  // STATUS
  // =========================

  function getStatusClass(status) {
    switch (status) {
      case "accepted":
        return "status-accepted";

      case "rejected":
        return "status-rejected";

      default:
        return "status-pending";
    }
  }

  function getStatusText(status) {
    switch (status) {
      case "accepted":
        return "Accepted";

      case "rejected":
        return "Rejected";

      default:
        return "Pending";
    }
  }

  // =========================
  // DATE FORMAT
  // =========================

  function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="applications-loading">
        <div className="applications-loading-icon">
          🚀
        </div>

        <h2>Loading your applications...</h2>

        <p>Please wait a moment.</p>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="applications-page">

      {/* HEADER */}

      <div className="applications-header">

        <button
          className="applications-back"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

        <h1>My Applications</h1>

        <p>
          Track your hackathon applications and
          teammate requests.
        </p>

      </div>

      {/* =========================
          HACKATHON APPLICATIONS
      ========================= */}

      <section className="applications-section">

        <div className="applications-section-header">

          <div>

            <h2>
              🚀 Hackathon Applications
            </h2>

            <p>
              Hackathons you have applied to.
            </p>

          </div>

          {applications.length > 0 && (
            <span className="application-count">
              {applications.length} Applied
            </span>
          )}

        </div>

        {applications.length === 0 ? (

          <div className="applications-empty small-empty">

            <div className="applications-empty-icon">
              🚀
            </div>

            <h3>
              No hackathon applications yet
            </h3>

            <p>
              Explore hackathons and find your next
              opportunity.
            </p>

            <button
              onClick={() => navigate("/hackathons")}
            >
              Explore Hackathons →
            </button>

          </div>

        ) : (

          <div className="applications-list">

            {applications.map((application) => {

              const hackathon =
                application.hackathon;

              return (
                <div
                  className="application-card"
                  key={application._id}
                >

                  {/* IMAGE */}

                  <div className="application-avatar">

                    {hackathon?.image ? (

                      <img
                        src={hackathon.image}
                        alt={hackathon.title}
                        className="application-hackathon-image"
                      />

                    ) : (

                      <span>🚀</span>

                    )}

                  </div>

                  {/* INFO */}

                  <div className="application-info">

                    <h2>
                      {hackathon?.title ||
                        "Unknown Hackathon"}
                    </h2>

                    <p>
                      Organized by{" "}
                      {hackathon?.organizer ||
                        "Unknown Organizer"}
                    </p>

                    {hackathon?.startDate && (
                      <span>
                        📅{" "}
                        {formatDate(
                          hackathon.startDate
                        )}

                        {hackathon.endDate &&
                          ` - ${formatDate(
                            hackathon.endDate
                          )}`}
                      </span>
                    )}

                    {hackathon?.mode && (
                      <span>
                        🌐 {hackathon.mode}
                      </span>
                    )}

                    {hackathon?.location && (
                      <span>
                        📍 {hackathon.location}
                      </span>
                    )}

                    {hackathon?.prize && (
                      <span>
                        🏆 Prize:{" "}
                        {hackathon.prize}
                      </span>
                    )}

                  </div>

                  {/* STATUS */}

                  <div className="application-status">

                    <span
                      className={getStatusClass(
                        application.status
                      )}
                    >
                      {getStatusText(
                        application.status
                      )}
                    </span>

                  </div>

                  {/* OFFICIAL WEBSITE */}

                  {hackathon?.officialUrl && (
                    <a
                      href={hackathon.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="application-link"
                    >
                      Visit Website ↗
                    </a>
                  )}

                </div>
              );
            })}

          </div>

        )}

      </section>

      {/* =========================
          SENT TEAM REQUESTS
      ========================= */}

      <section className="applications-section">

        <div className="applications-section-header">

          <div>

            <h2>
              🤝 Sent Team Requests
            </h2>

            <p>
              People you have invited to join
              your team.
            </p>

          </div>

          {requests.length > 0 && (
            <span className="application-count">
              {requests.length} Sent
            </span>
          )}

        </div>

        {requests.length === 0 ? (

          <div className="applications-empty small-empty">

            <div className="applications-empty-icon">
              🤝
            </div>

            <h3>
              No team requests sent
            </h3>

            <p>
              Find teammates and send them a
              team request.
            </p>

            <button
              onClick={() => navigate("/teammates")}
            >
              Find Teammates →
            </button>

          </div>

        ) : (

          <div className="applications-list">

            {requests.map((request) => {

              const receiver = getReceiver(request);

              return (
                <div
                  className="application-card"
                  key={request._id}
                >

                  {/* PROFILE PHOTO */}

                  <div className="application-avatar">

                    {receiver?.profilePhoto ? (

                      <img
                        src={receiver.profilePhoto}
                        alt={
                          receiver.name || "User"
                        }
                        className="application-profile-image"
                      />

                    ) : (

                      receiver?.name
                        ? receiver.name
                            .charAt(0)
                            .toUpperCase()
                        : "U"

                    )}

                  </div>

                  {/* USER INFO */}

                  <div className="application-info">

                    <h2>
                      {receiver?.name ||
                        "Unknown User"}
                    </h2>

                    <p>
                      {receiver?.college ||
                        "College not added"}
                    </p>

                    {(receiver?.branch ||
                      receiver?.year) && (

                      <span>

                        {receiver?.branch ||
                          "Branch not added"}

                        {receiver?.year &&
                          ` • Year ${receiver.year}`}

                      </span>

                    )}

                    {receiver?.skills?.length > 0 && (

                      <div className="team-request-skills">

                        {receiver.skills
                          .slice(0, 6)
                          .map(
                            (skill, index) => (
                              <span
                                key={index}
                              >
                                {skill}
                              </span>
                            )
                          )}

                      </div>

                    )}

                  </div>

                  {/* STATUS */}

                  <div className="application-status">

                    <span
                      className={getStatusClass(
                        request.status
                      )}
                    >
                      {getStatusText(
                        request.status
                      )}
                    </span>

                  </div>

                  {/* VIEW PROFILE */}

                  {receiver?._id && (

                    <button
                      className="application-view-profile"
                      onClick={() =>
                        navigate(
                          `/teammate/${receiver._id}`
                        )
                      }
                    >
                      View Profile
                    </button>

                  )}

                </div>
              );

            })}

          </div>

        )}

      </section>

      {/* FOOTER */}

      <div className="applications-footer">

        <button
          onClick={() =>
            navigate("/hackathons")
          }
        >
          🚀 Explore More Hackathons
        </button>

        <button
          onClick={() =>
            navigate("/teammates")
          }
        >
          👥 Find More Teammates
        </button>

      </div>

    </div>
  );
}

export default MyApplications;
