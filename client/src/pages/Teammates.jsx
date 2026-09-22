import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

function Teammates() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sendingRequest, setSendingRequest] = useState(null);
  const [sentRequests, setSentRequests] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    let currentUserId = null;

    if (savedUser) {
      try {
        const currentUser = JSON.parse(savedUser);
        currentUserId = currentUser.id;
      } catch (error) {
        console.error("Could not read logged-in user:", error);
      }
    }

    apiFetch("/api/users")
      .then((response) => response.json())
      .then((data) => {
        console.log("Teammates:", data);

        if (data.success) {
          const otherUsers = data.users.filter(
            (user) => user._id !== currentUserId
          );

          setUsers(otherUsers);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Teammates error:", error);
        alert("Could not connect to backend.");
        setLoading(false);
      });
  }, []);

  function handleViewProfile(userId) {
    navigate(`/teammate/${userId}`);
  }

  async function handleSendRequest(userId) {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    const currentUser = JSON.parse(savedUser);

    setSendingRequest(userId);

    try {
      const response = await apiFetch(
        "/api/team-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender: currentUser.id,
            receiver: userId,
          }),
        }
      );

      const data = await response.json();

      console.log("Team request response:", data);

      if (data.success) {
        setSentRequests((previous) => [...previous, userId]);
        alert("Team request sent successfully! 🤝");
      } else {
        alert(data.message || "Could not send request.");
      }
    } catch (error) {
      console.error("Send request error:", error);
      alert("Could not connect to backend.");
    } finally {
      setSendingRequest(null);
    }
  }

  const filteredUsers = users.filter((teammate) => {
    const searchText = search.toLowerCase();

    return (
      teammate.name?.toLowerCase().includes(searchText) ||
      teammate.college?.toLowerCase().includes(searchText) ||
      teammate.branch?.toLowerCase().includes(searchText) ||
      teammate.skills?.some((skill) =>
        skill.toLowerCase().includes(searchText)
      )
    );
  });

  if (loading) {
    return (
      <div className="teammates-loading">
        Loading teammates...
      </div>
    );
  }

  return (
    <div className="teammates-page">

      {/* HEADER */}
      <div className="teammates-header">

        <div>
          <button
            className="teammates-back"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>

          <h1>Find Teammates</h1>

          <p>
            Discover students with the skills you need
            for your next hackathon.
          </p>
        </div>

      </div>

      {/* SEARCH */}
      {users.length > 0 && (
        <div className="teammates-search-wrapper">
          <input
            type="text"
            className="teammates-search"
            placeholder="Search by name, college, branch or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* EMPTY STATE */}
      {users.length === 0 ? (

        <div className="teammates-empty">
          <div>👥</div>

          <h2>No teammates found</h2>

          <p>
            Other users will appear here after they complete
            their profiles.
          </p>
        </div>

      ) : filteredUsers.length === 0 ? (

        <div className="teammates-empty">
          <div>🔍</div>

          <h2>No matching teammates</h2>

          <p>
            Try searching with another name, college or skill.
          </p>
        </div>

      ) : (

        <div className="teammates-grid">

          {filteredUsers.map((teammate) => (

            <div
              className="teammate-card"
              key={teammate._id}
            >

              {/* AVATAR */}
              <div className="teammate-avatar">

                {teammate.profilePhoto ? (

                  <img
                    src={teammate.profilePhoto}
                    alt={teammate.name || "User"}
                    className="teammate-profile-photo"
                  />

                ) : (

                  teammate.name
                    ? teammate.name.charAt(0).toUpperCase()
                    : "U"

                )}

              </div>

              {/* NAME */}
              <h2>
                {teammate.name || "Anonymous User"}
              </h2>

              {/* COLLEGE */}
              <p className="teammate-college">
                {teammate.college || "College not added"}
              </p>

              {/* BRANCH + YEAR */}
              {(teammate.branch || teammate.year) && (
                <span className="teammate-branch">
                  {teammate.branch || "Branch not added"}

                  {teammate.year &&
                    ` • Year ${teammate.year}`}
                </span>
              )}

              {/* BIO */}
              {teammate.bio && (
                <p className="teammate-bio">
                  {teammate.bio}
                </p>
              )}

              {/* SKILLS */}
              <div className="teammate-section">

                <small>Skills</small>

                <div className="skill-list">

                  {teammate.skills?.length > 0 ? (

                    teammate.skills.slice(0, 6).map(
                      (skill, index) => (
                        <span key={index}>
                          {skill}
                        </span>
                      )
                    )

                  ) : (

                    <span className="muted">
                      No skills added
                    </span>

                  )}

                </div>

              </div>

              {/* INTEREST */}
              {teammate.experience && (
                <div className="teammate-interest">
                  <small>Interested in</small>

                  <strong>
                    {teammate.experience}
                  </strong>
                </div>
              )}

              {/* LOOKING FOR */}
              {teammate.lookingFor?.length > 0 && (
                <div className="teammate-looking">
                  <small>Looking for</small>

                  <p>
                    {teammate.lookingFor.join(", ")}
                  </p>
                </div>
              )}

              {/* LINKS */}
              {(teammate.github || teammate.linkedin) && (
                <div className="teammate-links">

                  {teammate.github && (
                    <a
                      href={teammate.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub ↗
                    </a>
                  )}

                  {teammate.linkedin && (
                    <a
                      href={teammate.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LinkedIn ↗
                    </a>
                  )}

                </div>
              )}

              {/* ACTIONS */}
              <div className="teammate-actions">

                <button
                  className="view-profile-button"
                  onClick={() =>
                    handleViewProfile(teammate._id)
                  }
                >
                  View Profile
                </button>

                <button
                  className="send-request-button"
                  onClick={() =>
                    handleSendRequest(teammate._id)
                  }
                  disabled={
                    sendingRequest === teammate._id ||
                    sentRequests.includes(teammate._id)
                  }
                >
                  {sendingRequest === teammate._id
                    ? "Sending..."
                    : sentRequests.includes(teammate._id)
                    ? "✓ Request Sent"
                    : "Send Request"}
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Teammates;
