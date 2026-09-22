import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";


function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [hackathons, setHackathons] = useState([]);
  const [hackathonsLoading, setHackathonsLoading] = useState(true);

  // ================= TEAM REQUESTS =================

  const [teamRequests, setTeamRequests] = useState([]);
  const [teamRequestsLoading, setTeamRequestsLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState(null);

  // ================= LOAD PROFILE =================

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      navigate("/");
      return;
    }

    try {
      const loggedInUser = JSON.parse(savedUser);
      const userId = loggedInUser.id || loggedInUser._id;

      if (!userId) {
        alert("Invalid user session.");
        navigate("/login");
        return;
      }

     apiFetch(`/api/profile/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("Dashboard profile:", data);

          if (data.success) {
            setUser(data.user);
          } else {
            alert("Could not load your profile.");
          }

          setLoading(false);
        })
        .catch((error) => {
          console.error("Dashboard profile error:", error);

          alert("Could not connect to backend.");

          setLoading(false);
        });
    } catch (error) {
      console.error("Invalid localStorage user:", error);

      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  // ================= LOAD HACKATHONS =================

  useEffect(() => {
    apiFetch("/api/hackathons")
      .then((response) => response.json())
      .then((data) => {
        console.log("Dashboard hackathons:", data);

        if (data.success) {
          setHackathons(
            Array.isArray(data.hackathons)
              ? data.hackathons
              : []
          );
        }

        setHackathonsLoading(false);
      })
      .catch((error) => {
        console.error("Hackathon fetch error:", error);

        setHackathonsLoading(false);
      });
  }, []);

  // ================= LOAD INCOMING TEAM REQUESTS =================

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTeamRequestsLoading(false);
      return;
    }

    try {
      const loggedInUser = JSON.parse(savedUser);
      const userId = loggedInUser.id || loggedInUser._id;

      if (!userId) {
        setTeamRequestsLoading(false);
        return;
      }

      apiFetch(
        `/api/team-requests/incoming/${userId}`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log(
            "Dashboard incoming team requests:",
            data
          );

          if (data.success) {
            setTeamRequests(
              Array.isArray(data.requests)
                ? data.requests
                : []
            );
          } else {
            setTeamRequests([]);
          }
        })
        .catch((error) => {
          console.error(
            "Incoming team requests error:",
            error
          );

          setTeamRequests([]);
        })
        .finally(() => {
          setTeamRequestsLoading(false);
        });
    } catch (error) {
      console.error(
        "Invalid localStorage user:",
        error
      );

      setTeamRequestsLoading(false);
    }
  }, []);

  // ================= ACCEPT / REJECT TEAM REQUEST =================

  async function handleTeamRequest(requestId, status) {
    if (processingRequest) {
      return;
    }

    try {
      setProcessingRequest(requestId);

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

      console.log(
        "Team request update response:",
        data
      );

      if (!data.success) {
        alert(
          data.message ||
            "Could not update team request."
        );
        return;
      }

      // Remove processed request from dashboard
      setTeamRequests((previousRequests) =>
        previousRequests.filter(
          (request) =>
            request._id !== requestId
        )
      );

      if (status === "accepted") {
        alert(
          "Team request accepted! Your team has been updated."
        );
      } else {
        alert("Team request rejected.");
      }
    } catch (error) {
      console.error(
        "Team request update error:",
        error
      );

      alert("Could not connect to backend.");
    } finally {
      setProcessingRequest(null);
    }
  }

  // ================= LOGOUT =================

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("newUserId");
    navigate("/");
  }

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading your dashboard...
      </div>
    );
  }

  // ================= DASHBOARD =================

  return (
    <div className="dashboard">

      {/* ================= SIDEBAR ================= */}

      <aside className="dashboard-sidebar">

        <div className="dashboard-logo">
          <span>🚀</span>
          HackathonOS
        </div>

        <nav className="dashboard-nav">

          <button
            className="active"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/hackathons")
            }
          >
            <span>⚡</span>
            Hackathons
          </button>

          <button
            onClick={() =>
              navigate("/teammates")
            }
          >
            <span>◉</span>
            Find Teammates
          </button>

          <button
            onClick={() =>
              navigate("/my-team")
            }
          >
            <span>👥</span>
            My Team
          </button>

          <button
            onClick={() =>
              navigate("/my-applications")
            }
          >
            <span>📋</span>
            My Applications
          </button>

        </nav>

        <div className="sidebar-bottom">

          <button
            onClick={() =>
              navigate("/profile")
            }
          >
            <span>●</span>
            My Profile
          </button>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="dashboard-main">

        {/* ================= HEADER ================= */}

        <header className="dashboard-header">

          <div className="welcome-area">

            <p className="dashboard-label">
              DASHBOARD
            </p>

            <h1>
              Welcome back{" "}
              <span className="welcome-name">
                {user?.name || "Developer"}
              </span>{" "}
              👋
            </h1>

            <p className="welcome-subtitle">
              Find hackathons, build your team and
              create something amazing.
            </p>

          </div>

          {/* USER PROFILE */}

          <div
            className="dashboard-user"
            onClick={() =>
              navigate("/profile")
            }
          >

            <div className="dashboard-avatar">

              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt="Profile"
                  className="dashboard-profile-photo"
                />
              ) : (
                user?.name
                  ? user.name
                      .charAt(0)
                      .toUpperCase()
                  : "U"
              )}

            </div>

            <div className="dashboard-user-info">

              <strong>
                {user?.name || "User"}
              </strong>

              <span>
                {user?.college ||
                  "Complete your profile"}
              </span>

            </div>

          </div>

        </header>

        {/* ================= QUICK ACTIONS ================= */}

        <section className="quick-actions">

          <div className="quick-card">

            <div className="quick-icon">
              ⚡
            </div>

            <div className="quick-content">

              <h3>
                Explore Hackathons
              </h3>

              <p>
                Discover upcoming hackathons and
                competitions.
              </p>

              <button
                onClick={() =>
                  navigate("/hackathons")
                }
              >
                Browse Hackathons →
              </button>

            </div>

          </div>

          <div className="quick-card">

            <div className="quick-icon">
              🤝
            </div>

            <div className="quick-content">

              <h3>
                Find Teammates
              </h3>

              <p>
                Connect with people who have
                complementary skills.
              </p>

              <button
                onClick={() =>
                  navigate("/teammates")
                }
              >
                Find Teammates →
              </button>

            </div>

          </div>

          <div className="quick-card">

            <div className="quick-icon">
              ➕
            </div>

            <div className="quick-content">

              <h3>
                Add Hackathon
              </h3>

              <p>
                Know a hackathon that should be on
                HackathonOS?
              </p>

              <button
                onClick={() =>
                  navigate("/add-hackathon")
                }
              >
                Add Hackathon →
              </button>

            </div>

          </div>

        </section>

        {/* ================= PROFILE ================= */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>

              <p className="section-label">
                PROFILE
              </p>

              <h2>
                Your Profile
              </h2>

              <p>
                Keep your profile updated to get
                better teammate matches.
              </p>

            </div>

            <button
              className="outline-button"
              onClick={() =>
                navigate("/profile")
              }
            >
              Edit Profile
            </button>

          </div>

          <div className="profile-overview">

            <div className="profile-overview-item">

              <span>🎓</span>

              <div>

                <small>
                  College
                </small>

                <strong>
                  {user?.college ||
                    "Not added"}
                </strong>

              </div>

            </div>

            <div className="profile-overview-item">

              <span>💻</span>

              <div>

                <small>
                  Branch
                </small>

                <strong>
                  {user?.branch ||
                    "Not added"}
                </strong>

              </div>

            </div>

            <div className="profile-overview-item">

              <span>🛠</span>

              <div>

                <small>
                  Skills
                </small>

                <strong>
                  {user?.skills?.length
                    ? user.skills.join(", ")
                    : "Not added"}
                </strong>

              </div>

            </div>

            <div className="profile-overview-item">

              <span>🤝</span>

              <div>

                <small>
                  Looking for
                </small>

                <strong>
                  {user?.lookingFor?.length
                    ? user.lookingFor.join(", ")
                    : "Not added"}
                </strong>

              </div>

            </div>

          </div>

        </section>

        {/* ================= HACKATHONS ================= */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>

              <h2>
                🔥 Recommended Hackathons
              </h2>

              <p>
                Discover the latest hackathons
                available on HackathonOS.
              </p>

            </div>

            <button
              onClick={() =>
                navigate("/hackathons")
              }
            >
              View All
            </button>

          </div>

          {hackathonsLoading ? (

            <div className="hackathons-dashboard-loading">
              Loading hackathons...
            </div>

          ) : hackathons.length === 0 ? (

            <div className="empty-hackathons">

              <div>
                🚀
              </div>

              <h3>
                No hackathons available
              </h3>

              <p>
                Add a hackathon to start building
                the community.
              </p>

              <button
                onClick={() =>
                  navigate("/add-hackathon")
                }
              >
                Add Hackathon
              </button>

            </div>

          ) : (

            <div className="dashboard-hackathon-grid">

              {hackathons
                .slice(0, 3)
                .map((hackathon) => (

                  <div
                    className="dashboard-hackathon-card"
                    key={hackathon._id}
                  >

                    <div className="dashboard-hackathon-top">

                      <span>
                        {hackathon.mode}
                      </span>

                      {hackathon.domains?.[0] && (
                        <span>
                          {hackathon.domains[0]}
                        </span>
                      )}

                    </div>

                    <h3>
                      {hackathon.title}
                    </h3>

                    <p>
                      {hackathon.organizer}
                    </p>

                    <div className="dashboard-hackathon-info">

                      <span>
                        📅{" "}
                        {new Date(
                          hackathon.startDate
                        ).toLocaleDateString()}
                      </span>

                      <span>
                        🏆{" "}
                        {hackathon.prize ||
                          "Prize TBA"}
                      </span>

                    </div>

                    {hackathon.officialUrl && (
                      <a
                        href={
                          hackathon.officialUrl
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit Official Website →
                      </a>
                    )}

                  </div>

                ))}

            </div>

          )}

        </section>

        {/* ================= INCOMING TEAM REQUESTS ================= */}

        {!teamRequestsLoading &&
          teamRequests.length > 0 && (

            <section className="dashboard-section">

              <div className="section-header">

                <div>

                  <p className="section-label">
                    TEAM
                  </p>

                  <h2>
                    🤝 Team Requests
                  </h2>

                  <p>
                    People who want to build
                    something with you.
                  </p>

                </div>

                <button
                  onClick={() =>
                    navigate("/team-requests")
                  }
                >
                  View All
                </button>

              </div>

              <div className="team-requests-dashboard">

                {teamRequests.map((request) => {

                  const sender =
                    request.sender;

                  const isProcessing =
                    processingRequest ===
                    request._id;

                  return (
                    <div
                      className="team-request-card"
                      key={request._id}
                    >

                      {/* PROFILE */}

                      <div className="team-request-profile">

                        <div className="team-request-avatar">

                          {sender?.profilePhoto ? (
                            <img
                              src={
                                sender.profilePhoto
                              }
                              alt={
                                sender.name ||
                                "User"
                              }
                              className="team-request-profile-photo"
                            />
                          ) : (
                            sender?.name
                              ? sender.name
                                  .charAt(0)
                                  .toUpperCase()
                              : "U"
                          )}

                        </div>

                        <div className="team-request-info">

                          <h3>
                            {sender?.name ||
                              "Unknown User"}
                          </h3>

                          <p>
                            {sender?.college ||
                              "College not added"}
                          </p>

                          <span>
                            {sender?.branch ||
                              "Branch not added"}
                          </span>

                        </div>

                      </div>

                      {/* SKILLS */}

                      {sender?.skills?.length >
                        0 && (

                        <div className="team-request-skills">

                          {sender.skills
                            .slice(0, 4)
                            .map(
                              (
                                skill,
                                index
                              ) => (
                                <span
                                  key={index}
                                >
                                  {skill}
                                </span>
                              )
                            )}

                        </div>

                      )}

                      {/* BIO */}

                      {sender?.bio && (
                        <p className="team-request-bio">
                          {sender.bio.length > 120
                            ? `${sender.bio.slice(
                                0,
                                120
                              )}...`
                            : sender.bio}
                        </p>
                      )}

                      {/* ACTIONS */}

                      <div className="team-request-actions">

                        <button
                          className="request-view"
                          disabled={
                            isProcessing
                          }
                          onClick={() => {
                            if (
                              sender?._id
                            ) {
                              navigate(
                                `/teammate/${sender._id}`
                              );
                            }
                          }}
                        >
                          View Profile
                        </button>

                        <button
                          className="request-accept"
                          disabled={
                            isProcessing
                          }
                          onClick={() =>
                            handleTeamRequest(
                              request._id,
                              "accepted"
                            )
                          }
                        >
                          {isProcessing
                            ? "..."
                            : "Accept"}
                        </button>

                        <button
                          className="request-reject"
                          disabled={
                            isProcessing
                          }
                          onClick={() =>
                            handleTeamRequest(
                              request._id,
                              "rejected"
                            )
                          }
                        >
                          {isProcessing
                            ? "..."
                            : "Reject"}
                        </button>

                      </div>

                    </div>
                  );
                })}

              </div>

            </section>
          )}

        {/* ================= ADD HACKATHON ================= */}

        <section className="dashboard-section add-hackathon-section">

          <div>

            <p className="section-label">
              COMMUNITY
            </p>

            <h2>
              Know a hackathon?
            </h2>

            <p>
              Help the community discover more
              opportunities by adding a hackathon.
            </p>

          </div>

          <button
            className="primary-button"
            onClick={() =>
              navigate("/add-hackathon")
            }
          >
            + Add Hackathon
          </button>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;
