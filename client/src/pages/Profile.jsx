import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

function Profile() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [domain, setDomain] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");

  // PROFILE PHOTO
  const [profilePhoto, setProfilePhoto] = useState("");
  const [photoError, setPhotoError] = useState("");

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // ==============================
  // LOAD PROFILE
  // ==============================

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const newUserId = localStorage.getItem("newUserId");

    // NEW USER FROM SIGNUP
    if (!savedUser && newUserId) {
      console.log("New user profile setup");

      // The account was just created, so there is no remote profile to load.
      queueMicrotask(() => {
        setLoading(false);
        setIsEditing(false);
      });

      return;
    }

    // EXISTING LOGGED-IN USER
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const userId = user.id || user._id;

      if (!userId) {
        alert("Invalid user session.");
        navigate("/login");
        return;
      }

      apiFetch(`/api/profile/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("PROFILE DATA:", data);

          if (data.success) {
            const profile = data.user;

            setName(profile.name || "");
            setCollege(profile.college || "");
            setBranch(profile.branch || "");
            setYear(profile.year || "");
            setBio(profile.bio || "");

            setSkills(
              profile.skills
                ? profile.skills.join(", ")
                : ""
            );

            setDomain(profile.experience || "");

            setLookingFor(
              profile.lookingFor
                ? profile.lookingFor.join(", ")
                : ""
            );

            setGithub(profile.github || "");
            setLinkedin(profile.linkedin || "");

            // LOAD EXISTING PHOTO
            setProfilePhoto(profile.profilePhoto || "");

            setIsEditing(true);
          }

          setLoading(false);
        })
        .catch((error) => {
          console.error("Profile loading error:", error);

          alert("Could not load profile.");
          setLoading(false);
        });

      return;
    }

    // NO USER
    alert("Please login or create an account.");
    navigate("/login");
  }, [navigate]);

  // ==============================
  // PROFILE PHOTO SELECT
  // ==============================

  function handlePhotoChange(event) {
    const file = event.target.files[0];

    if (!file) return;

    setPhotoError("");

    // Only images
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select a valid image.");
      return;
    }

    // Maximum 2 MB
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Image must be smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfilePhoto(reader.result);
    };

    reader.readAsDataURL(file);
  }

  // ==============================
  // SAVE / UPDATE PROFILE
  // ==============================

  async function handleProfileSubmit(event) {
    event.preventDefault();

    console.log("PROFILE SAVE BUTTON CLICKED");

    const savedUser = localStorage.getItem("user");
    const newUserId = localStorage.getItem("newUserId");

    let userId;

    // EXISTING USER
    if (savedUser) {
      const user = JSON.parse(savedUser);
      userId = user.id || user._id;
    }

    // NEW USER
    else if (newUserId) {
      userId = newUserId;
    }

    else {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    try {
      const response = await apiFetch(
        `/api/profile/${userId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            name,
            college,
            branch,
            year,

            skills: skills
              .split(",")
              .map((skill) => skill.trim())
              .filter((skill) => skill !== ""),

            experience: domain,

            bio,

            lookingFor: lookingFor
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item !== ""),

            github,
            linkedin,

            // PROFILE PHOTO
            profilePhoto
          })
        }
      );

      const data = await response.json();

      console.log("PROFILE UPDATE RESPONSE:", data);

      if (data.success) {
        alert(
          isEditing
            ? "Profile updated successfully! 🎉"
            : "Profile created successfully! 🎉"
        );

        // CREATE PROPER LOGIN SESSION
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.user._id,
            name: data.user.name,
            email: data.user.email,
            profileCompleted: true
          })
        );

        // New-user temporary ID is no longer needed
        localStorage.removeItem("newUserId");

        // Go to dashboard
        navigate("/dashboard");
      }

      else {
        alert(
          data.message ||
          "Could not save profile."
        );
      }
    }

    catch (error) {
      console.error("Profile save error:", error);

      alert("Could not connect to backend.");
    }
  }

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div className="profile-page">
        <h2>Loading profile...</h2>
      </div>
    );
  }

  // ==============================
  // UI
  // ==============================

  return (
    <div className="profile-page">

      <div className="profile-card">

        <h1>
          {isEditing
            ? "Edit your profile"
            : "Complete your profile"}
        </h1>

        <p className="profile-subtitle">
          {isEditing
            ? "Update your information whenever you want."
            : "Help teammates know who you are and what you can build."}
        </p>

        <form onSubmit={handleProfileSubmit}>

          {/* PROFILE PHOTO */}

          <div className="photo-section">

            <div className="photo-placeholder">

              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile preview"
                  className="profile-photo-preview"
                />
              ) : (
                "👤"
              )}

            </div>

            <div className="photo-upload-info">

              <h3>
                Profile Photo
              </h3>

              <p>
                Upload a clear photo of yourself.
              </p>

              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />

              {photoError && (
                <small className="photo-error">
                  {photoError}
                </small>
              )}

              {profilePhoto && (
                <button
                  type="button"
                  className="remove-photo-button"
                  onClick={() => {
                    setProfilePhoto("");
                    setPhotoError("");
                  }}
                >
                  Remove Photo
                </button>
              )}

            </div>

          </div>

          <div className="profile-form">

            {/* NAME */}

            <div className="form-group">
              <label>
                Full Name
              </label>

              <input
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
              />
            </div>

            {/* COLLEGE */}

            <div className="form-group">
              <label>
                College / University
              </label>

              <input
                type="text"
                placeholder="Your college name"
                value={college}
                onChange={(event) =>
                  setCollege(event.target.value)
                }
              />
            </div>

            {/* BRANCH + YEAR */}

            <div className="form-row">

              <div className="form-group">

                <label>
                  Branch
                </label>

                <input
                  type="text"
                  placeholder="e.g. CSE, ECE"
                  value={branch}
                  onChange={(event) =>
                    setBranch(event.target.value)
                  }
                />

              </div>

              <div className="form-group">

                <label>
                  Year
                </label>

                <select
                  value={year}
                  onChange={(event) =>
                    setYear(event.target.value)
                  }
                >
                  <option value="">
                    Select year
                  </option>

                  <option value="1">
                    1st Year
                  </option>

                  <option value="2">
                    2nd Year
                  </option>

                  <option value="3">
                    3rd Year
                  </option>

                  <option value="4">
                    4th Year
                  </option>

                </select>

              </div>

            </div>

            {/* BIO */}

            <div className="form-group">

              <label>
                Bio
              </label>

              <textarea
                placeholder="Tell teammates a little about yourself..."
                rows="4"
                value={bio}
                onChange={(event) =>
                  setBio(event.target.value)
                }
              />

            </div>

            {/* SKILLS */}

            <div className="form-group">

              <label>
                Skills
              </label>

              <input
                type="text"
                placeholder="e.g. React, Python, UI/UX, ML"
                value={skills}
                onChange={(event) =>
                  setSkills(event.target.value)
                }
              />

              <small>
                Separate multiple skills with commas.
              </small>

            </div>

            {/* DOMAIN */}

            <div className="form-group">

              <label>
                What are you interested in?
              </label>

              <select
                value={domain}
                onChange={(event) =>
                  setDomain(event.target.value)
                }
              >

                <option value="">
                  Select a domain
                </option>

                <option value="web">
                  Web Development
                </option>

                <option value="app">
                  App Development
                </option>

                <option value="ai">
                  AI / ML
                </option>

                <option value="blockchain">
                  Blockchain
                </option>

                <option value="cybersecurity">
                  Cybersecurity
                </option>

                <option value="iot">
                  IoT
                </option>

                <option value="robotics">
                  Robotics
                </option>

                <option value="design">
                  UI / UX
                </option>

              </select>

            </div>

            {/* LOOKING FOR */}

            <div className="form-group">

              <label>
                Looking for
              </label>

              <input
                type="text"
                placeholder="e.g. Backend developer, UI designer"
                value={lookingFor}
                onChange={(event) =>
                  setLookingFor(event.target.value)
                }
              />

              <small>
                Separate multiple roles with commas.
              </small>

            </div>

            {/* GITHUB + LINKEDIN */}

            <div className="profile-links">

              <div className="form-group">

                <label>
                  GitHub (optional)
                </label>

                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={github}
                  onChange={(event) =>
                    setGithub(event.target.value)
                  }
                />

              </div>

              <div className="form-group">

                <label>
                  LinkedIn (optional)
                </label>

                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedin}
                  onChange={(event) =>
                    setLinkedin(event.target.value)
                  }
                />

              </div>

            </div>

            {/* SAVE */}

            <button
              type="submit"
              className="profile-save"
            >
              {isEditing
                ? "Update Profile →"
                : "Save & Continue →"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default Profile;
