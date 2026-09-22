import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api";

function MyProfile() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    const loggedInUser = JSON.parse(savedUser);
    const profileId = id || loggedInUser.id || loggedInUser._id;

    apiFetch(`/api/profile/${profileId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("MY PROFILE RESPONSE:", data);

        if (data.success) {
          setUser(data.user);
        } else {
          alert(data.message || "Could not load profile.");
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("MY PROFILE ERROR:", error);
        setLoading(false);
      });
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="my-profile-page">
        <div className="my-profile-card">
          <h2>Loading profile...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="my-profile-page">
        <div className="my-profile-card">
          <h2>Profile not found.</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="my-profile-page">

      <div className="my-profile-card">

        {/* Profile Photo */}
        <div className="my-profile-avatar">
          {user.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user.name}
              className="my-profile-photo"
            />
          ) : (
            <span>👤</span>
          )}
        </div>

        {/* Basic Information */}
        <h1>{user.name}</h1>

        <p className="profile-email">
          {user.email}
        </p>

        <p className="profile-college">
          {user.college || "College not added"}
        </p>

        <p className="profile-academic">
          {user.branch || "Branch not added"}
          {" • "}
          {user.year || "Year not added"}
        </p>

        {/* About */}
        {user.bio && (
          <div className="profile-section">
            <h3>About</h3>
            <p>{user.bio}</p>
          </div>
        )}

        {/* Skills */}
        {user.skills && user.skills.length > 0 && (
          <div className="profile-section">
            <h3>Skills</h3>

            <div className="skills">
              {user.skills.map((skill, index) => (
                <span key={index}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {user.experience && (
          <div className="profile-section">
            <h3>Experience</h3>
            <p>{user.experience}</p>
          </div>
        )}

        {/* Looking For */}
        {user.lookingFor && user.lookingFor.length > 0 && (
          <div className="profile-section">
            <h3>Looking For</h3>

            <div className="skills">
              {user.lookingFor.map((item, index) => (
                <span key={index}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Social Links */}
        {(user.github || user.linkedin) && (
          <div className="profile-links">

            {user.github && (
              <a
                href={user.github}
                target="_blank"
                rel="noreferrer"
              >
                GitHub ↗
              </a>
            )}

            {user.linkedin && (
              <a
                href={user.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn ↗
              </a>
            )}

          </div>
        )}

        {/* Edit Button */}
        {!id && <button className="profile-edit-button" onClick={() => navigate("/profile")}>
          Edit Profile ✏️
        </button>}

      </div>

    </div>
  );
}

export default MyProfile;
