import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

function AddHackathon() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mode, setMode] = useState("Online");
  const [location, setLocation] = useState("");
  const [domains, setDomains] = useState("");
  const [officialUrl, setOfficialUrl] = useState("");
  const [image, setImage] = useState("");
  const [prize, setPrize] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");

  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim() || !organizer.trim() || !startDate || !endDate || !officialUrl.trim()) {
      alert("Please fill all required fields.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert("End date cannot be before start date.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch(
        "/api/hackathons",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            organizer: organizer.trim(),
            description: description.trim(),
            startDate,
            endDate,
            mode,
            location: location.trim(),

            domains: domains
              .split(",")
              .map((domain) => domain.trim())
              .filter((domain) => domain !== ""),

            officialUrl: officialUrl.trim(),
            image: image.trim(),
            prize: prize.trim(),
            registrationDeadline:
              registrationDeadline || undefined,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Hackathon added successfully! 🎉");
        navigate("/hackathons");
      } else {
        alert(data.message || "Could not add hackathon.");
      }
    } catch (error) {
      console.error("Add hackathon error:", error);
      alert("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="add-hackathon-page">

      <div className="add-hackathon-card">

        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

        <div className="add-hackathon-heading">
          <div className="add-hackathon-icon">🚀</div>

          <div>
            <h1>Add Hackathon</h1>
            <p>
              Share an exciting hackathon with the HackathonOS community.
            </p>
          </div>
        </div>

        <div className="required-note">
          <span>*</span> Required fields
        </div>

        <form onSubmit={handleSubmit}>

          {/* BASIC INFORMATION */}

          <div className="form-section">
            <div className="form-section-title">
              <span>📋</span>
              <div>
                <h2>Basic Information</h2>
                <p>Tell participants about the hackathon.</p>
              </div>
            </div>

            <div className="form-group">
              <label>
                Hackathon Name <span>*</span>
              </label>

              <input
                type="text"
                placeholder="e.g. Smart India Hackathon"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                Organizer <span>*</span>
              </label>

              <input
                type="text"
                placeholder="e.g. Government of India"
                value={organizer}
                onChange={(event) => setOrganizer(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Description</label>

              <textarea
                rows="5"
                placeholder="Describe the hackathon, its theme, objectives, and what participants can expect..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </div>

          {/* DATES */}

          <div className="form-section">
            <div className="form-section-title">
              <span>📅</span>
              <div>
                <h2>Schedule</h2>
                <p>Set the hackathon dates and registration deadline.</p>
              </div>
            </div>

            <div className="form-row">

              <div className="form-group">
                <label>
                  Start Date <span>*</span>
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>
                  End Date <span>*</span>
                </label>

                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>

            </div>

            <div className="form-group">
              <label>Registration Deadline</label>

              <input
                type="date"
                value={registrationDeadline}
                onChange={(event) =>
                  setRegistrationDeadline(event.target.value)
                }
              />
            </div>
          </div>

          {/* MODE */}

          <div className="form-section">
            <div className="form-section-title">
              <span>🌐</span>
              <div>
                <h2>Event Details</h2>
                <p>Where and how will the hackathon take place?</p>
              </div>
            </div>

            <div className="form-row">

              <div className="form-group">
                <label>Mode</label>

                <select
                  value={mode}
                  onChange={(event) => setMode(event.target.value)}
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="form-group">
                <label>Location</label>

                <input
                  type="text"
                  placeholder="e.g. New Delhi / Online"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                />
              </div>

            </div>

            <div className="form-group">
              <label>Domains</label>

              <input
                type="text"
                placeholder="AI, Web Development, IoT, Blockchain"
                value={domains}
                onChange={(event) => setDomains(event.target.value)}
              />

              <small>
                Separate multiple domains with commas.
              </small>
            </div>
          </div>

          {/* PRIZE */}

          <div className="form-section">
            <div className="form-section-title">
              <span>🏆</span>
              <div>
                <h2>Rewards</h2>
                <p>Let participants know what's at stake.</p>
              </div>
            </div>

            <div className="form-group">
              <label>Prize Pool</label>

              <input
                type="text"
                placeholder="e.g. ₹10,00,000"
                value={prize}
                onChange={(event) => setPrize(event.target.value)}
              />
            </div>
          </div>

          {/* LINKS */}

          <div className="form-section">
            <div className="form-section-title">
              <span>🔗</span>
              <div>
                <h2>Links & Media</h2>
                <p>Add the official registration page and a cover image.</p>
              </div>
            </div>

            <div className="form-group">
              <label>
                Official Hackathon URL <span>*</span>
              </label>

              <input
                type="url"
                placeholder="https://example.com/hackathon"
                value={officialUrl}
                onChange={(event) =>
                  setOfficialUrl(event.target.value)
                }
              />

              <small>
                Participants will be redirected to this official website.
              </small>
            </div>

            <div className="form-group">
              <label>Hackathon Image URL</label>

              <input
                type="url"
                placeholder="https://example.com/hackathon-banner.jpg"
                value={image}
                onChange={(event) => {
                  setImage(event.target.value);
                  setImageError(false);
                }}
              />

              <small>
                Add a public image URL for the hackathon cover.
              </small>
            </div>

            {image && !imageError && (
              <div className="image-preview">
                <p>Image Preview</p>

                <img
                  src={image}
                  alt="Hackathon preview"
                  onError={() => setImageError(true)}
                />
              </div>
            )}

            {image && imageError && (
              <div className="image-error">
                ⚠️ This image URL could not be loaded.
              </div>
            )}
          </div>

          {/* SUBMIT */}

          <div className="form-submit-area">

            <button
              type="button"
              className="cancel-hackathon-button"
              onClick={() => navigate("/hackathons")}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="add-hackathon-button"
              disabled={loading}
            >
              {loading
                ? "Adding Hackathon..."
                : "🚀 Add Hackathon"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddHackathon;
