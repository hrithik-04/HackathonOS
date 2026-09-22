import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

function MyTeam() {
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTeam() {
      try {
        const savedUser = localStorage.getItem("user");

        if (!savedUser) {
          navigate("/login");
          return;
        }

        const user = JSON.parse(savedUser);
        const userId = user.id || user._id;

        if (!userId) {
          setError("User ID not found. Please login again.");
          setLoading(false);
          return;
        }

        const response = await apiFetch(
          `/api/my-team/${userId}`
        );

        const data = await response.json();

        console.log("MY TEAM API RESPONSE:", data);

        if (!response.ok || !data.success) {
          setError(data.message || "Could not load your team.");
          return;
        }

        setTeam(data.team || null);
      } catch (error) {
        console.error("MY TEAM ERROR:", error);
        setError("Could not connect to backend.");
      } finally {
        setLoading(false);
      }
    }

    loadTeam();
  }, [navigate]);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="my-team-page">
        <div className="my-team-loading">
          <div className="my-team-loading-icon">👥</div>
          <h2>Loading your team...</h2>
          <p>Please wait a moment.</p>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="my-team-page">

        <div className="my-team-header">
          <button
            onClick={() => navigate("/dashboard")}
            className="my-team-back"
          >
            ← Dashboard
          </button>

          <h1>My Team</h1>
        </div>

        <div className="my-team-empty">

          <div className="my-team-empty-icon">
            ⚠️
          </div>

          <h2>Something went wrong</h2>

          <p>{error}</p>

          <button
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // =========================
  // NO TEAM
  // =========================

  if (!team) {
    return (
      <div className="my-team-page">

        <div className="my-team-header">

          <button
            onClick={() => navigate("/dashboard")}
            className="my-team-back"
          >
            ← Dashboard
          </button>

          <h1>My Team</h1>

          <p>
            View and manage your hackathon team members.
          </p>

        </div>

        <div className="my-team-empty">

          <div className="my-team-empty-icon">
            🤝
          </div>

          <h2>No Team Yet</h2>

          <p>
            You don't belong to a team yet.
            Find teammates and send requests to build your team.
          </p>

          <button
            onClick={() => navigate("/teammates")}
          >
            Find Teammates →
          </button>

        </div>

      </div>
    );
  }

  const members = Array.isArray(team.members)
    ? team.members
    : [];

  return (
    <div className="my-team-page">

      {/* HEADER */}

      <div className="my-team-header">

        <button
          onClick={() => navigate("/dashboard")}
          className="my-team-back"
        >
          ← Dashboard
        </button>

        <h1>My Team</h1>

        <p>
          Collaborate with your teammates and build something amazing.
        </p>

      </div>


      {/* TEAM SUMMARY */}

      <div className="my-team-container">

        <div className="team-info">

          <div>
            <h2>Your Team</h2>

            <p>
              {members.length} member
              {members.length === 1 ? "" : "s"}
            </p>
          </div>

          <button
            className="find-more-teammates"
            onClick={() => navigate("/teammates")}
          >
            Find Teammates
          </button>

        </div>


        {/* MEMBERS */}

        {members.length === 0 ? (

          <div className="my-team-empty">

            <h2>Team found, but no members loaded.</h2>

            <p>
              The backend returned a team, but its members
              could not be loaded.
            </p>

          </div>

        ) : (

          <div className="team-members">

            {members.map((member, index) => {

              if (!member) return null;

              return (
                <div
                  className="team-member-card"
                  key={member._id || index}
                >

                  {/* PROFILE PHOTO */}

                  <div className="team-member-avatar">

                    {member.profilePhoto ? (

                      <img
                        src={member.profilePhoto}
                        alt={member.name || "Team member"}
                        className="team-member-profile-photo"
                      />

                    ) : (

                      member.name
                        ? member.name.charAt(0).toUpperCase()
                        : "U"

                    )}

                  </div>


                  {/* MEMBER INFO */}

                  <div className="team-member-info">

                    <div className="team-member-heading">

                      <h3>
                        {member.name || "Anonymous User"}
                      </h3>

                      <span className="team-member-badge">
                        Team Member
                      </span>

                    </div>


                    <p className="team-member-college">
                      {member.college || "College not added"}
                    </p>


                    {(member.branch || member.year) && (

                      <span className="team-member-academic">
                        {member.branch || "Branch not added"}

                        {member.year &&
                          ` • Year ${member.year}`}
                      </span>

                    )}


                    {/* BIO */}

                    {member.bio && (

                      <p className="team-member-bio">
                        {member.bio}
                      </p>

                    )}


                    {/* SKILLS */}

                    {Array.isArray(member.skills) &&
                      member.skills.length > 0 && (

                        <div className="team-member-skills">

                          {member.skills
                            .slice(0, 8)
                            .map((skill, skillIndex) => (

                              <span key={skillIndex}>
                                {skill}
                              </span>

                            ))}

                        </div>

                      )}


                    {/* LINKS */}

                    {(member.github || member.linkedin) && (

                      <div className="team-member-links">

                        {member.github && (
                          <a
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            GitHub ↗
                          </a>
                        )}

                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            LinkedIn ↗
                          </a>
                        )}

                      </div>

                    )}


                    {/* VIEW PROFILE */}

                    <button
                      className="team-member-profile-button"
                      onClick={() =>
                        navigate(`/teammate/${member._id}`)
                      }
                    >
                      View Profile
                    </button>

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </div>

    </div>
  );
}

export default MyTeam;
