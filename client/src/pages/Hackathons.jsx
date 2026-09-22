import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

function Hackathons() {
  const navigate = useNavigate();

  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [applyingId, setApplyingId] = useState(null);
  const [appliedHackathons, setAppliedHackathons] = useState([]);

  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("All");
  const [domainFilter, setDomainFilter] = useState("All");

  // ================= LOAD HACKATHONS =================

  useEffect(() => {
    apiFetch("/api/hackathons")
      .then((response) => response.json())
      .then((data) => {
        console.log("Hackathons:", data);

        if (data.success) {
          setHackathons(data.hackathons || []);
        } else {
          alert(data.message || "Could not load hackathons.");
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Hackathon fetch error:", error);
        alert("Could not connect to backend.");
        setLoading(false);
      });
  }, []);

  // ================= LOAD MY APPLICATIONS =================

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) return;

    try {
      const loggedInUser = JSON.parse(savedUser);
      const userId = loggedInUser.id || loggedInUser._id;

      if (!userId) return;

      apiFetch(`/api/applications/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("My applications:", data);

          if (data.success) {
            const hackathonIds = (data.applications || [])
              .filter((application) => application.hackathon)
              .map((application) => application.hackathon._id);

            setAppliedHackathons(hackathonIds);
          }
        })
        .catch((error) => {
          console.error("Applications fetch error:", error);
        });
    } catch (error) {
      console.error("Invalid saved user:", error);
    }
  }, []);

  // ================= FILTER OPTIONS =================

  const allDomains = useMemo(() => {
    const domains = hackathons.flatMap((hackathon) =>
      Array.isArray(hackathon.domains) ? hackathon.domains : []
    );

    return [...new Set(domains)].sort();
  }, [hackathons]);

  // ================= FILTER HACKATHONS =================

  const filteredHackathons = useMemo(() => {
    const query = search.trim().toLowerCase();

    return hackathons.filter((hackathon) => {
      const title = hackathon.title?.toLowerCase() || "";
      const organizer = hackathon.organizer?.toLowerCase() || "";
      const description = hackathon.description?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        title.includes(query) ||
        organizer.includes(query) ||
        description.includes(query);

      const matchesMode =
        modeFilter === "All" ||
        hackathon.mode?.toLowerCase() === modeFilter.toLowerCase();

      const matchesDomain =
        domainFilter === "All" ||
        hackathon.domains?.some(
          (domain) =>
            domain.toLowerCase() === domainFilter.toLowerCase()
        );

      return matchesSearch && matchesMode && matchesDomain;
    });
  }, [hackathons, search, modeFilter, domainFilter]);

  // ================= APPLY =================

  async function handleApply(hackathonId) {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    let loggedInUser;

    try {
      loggedInUser = JSON.parse(savedUser);
    } catch {
      alert("Please login again.");
      navigate("/login");
      return;
    }

    const userId = loggedInUser.id || loggedInUser._id;

    if (!userId) {
      alert("User information not found. Please login again.");
      return;
    }

    if (appliedHackathons.includes(hackathonId)) {
      alert("You have already applied to this hackathon.");
      return;
    }

    setApplyingId(hackathonId);

    try {
      const response = await apiFetch(
        "/api/applications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            hackathonId,
          }),
        }
      );

      const data = await response.json();

      console.log("Application response:", data);

      if (data.success) {
        alert("Application submitted successfully! 🎉");

        setAppliedHackathons((previous) => [
          ...previous,
          hackathonId,
        ]);
      } else {
        alert(data.message || "Could not submit application.");
      }
    } catch (error) {
      console.error("Apply error:", error);
      alert("Could not connect to backend.");
    } finally {
      setApplyingId(null);
    }
  }

  // ================= DATE FORMAT =================

  function formatDate(date) {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // ================= IMAGE ERROR =================

  function handleImageError(event) {
    event.currentTarget.style.display = "none";

    if (event.currentTarget.nextSibling) {
      event.currentTarget.nextSibling.style.display = "flex";
    }
  }

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="hackathons-loading">
        <div className="hackathon-loading-spinner"></div>
        <h2>Loading hackathons...</h2>
        <p>Finding the latest opportunities for you.</p>
      </div>
    );
  }

  // ================= PAGE =================

  return (
    <div className="hackathons-page">

      {/* HEADER */}

      <div className="hackathons-header">

        <div>
          <button
            className="hackathons-back"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>

          <div className="hackathons-title-row">
            <div className="hackathons-title-icon">
              🚀
            </div>

            <div>
              <h1>Explore Hackathons</h1>

              <p>
                Discover opportunities, build amazing projects
                and find your next challenge.
              </p>
            </div>
          </div>
        </div>

        <button
          className="add-hackathon-top"
          onClick={() => navigate("/add-hackathon")}
        >
          + Add Hackathon
        </button>

      </div>

      {/* SEARCH + FILTER */}

      {hackathons.length > 0 && (
        <div className="hackathon-filters">

          <div className="hackathon-search">
            <span>🔎</span>

            <input
              type="text"
              placeholder="Search hackathons, organizers..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="clear-search"
              >
                ×
              </button>
            )}
          </div>

          <select
            value={modeFilter}
            onChange={(event) => setModeFilter(event.target.value)}
          >
            <option value="All">All Modes</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Hybrid">Hybrid</option>
          </select>

          <select
            value={domainFilter}
            onChange={(event) => setDomainFilter(event.target.value)}
          >
            <option value="All">All Domains</option>

            {allDomains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>

        </div>
      )}

      {/* RESULT COUNT */}

      {hackathons.length > 0 && (
        <div className="hackathon-result-info">
          <strong>{filteredHackathons.length}</strong>{" "}
          hackathon
          {filteredHackathons.length !== 1 ? "s" : ""} found
        </div>
      )}

      {/* EMPTY DATABASE */}

      {hackathons.length === 0 ? (

        <div className="hackathons-empty">

          <div className="empty-icon">
            🚀
          </div>

          <h2>No hackathons yet</h2>

          <p>
            Be the first to add a hackathon to the
            HackathonOS community.
          </p>

          <button
            onClick={() => navigate("/add-hackathon")}
          >
            Add First Hackathon
          </button>

        </div>

      ) : filteredHackathons.length === 0 ? (

        /* NO SEARCH RESULTS */

        <div className="hackathons-empty">

          <div className="empty-icon">
            🔎
          </div>

          <h2>No matching hackathons</h2>

          <p>
            Try changing your search or filters.
          </p>

          <button
            onClick={() => {
              setSearch("");
              setModeFilter("All");
              setDomainFilter("All");
            }}
          >
            Clear Filters
          </button>

        </div>

      ) : (

        /* HACKATHON GRID */

        <div className="hackathon-grid">

          {filteredHackathons.map((hackathon) => {

            const isApplied =
              appliedHackathons.includes(hackathon._id);

            const isApplying =
              applyingId === hackathon._id;

            return (
              <div
                className="hackathon-card"
                key={hackathon._id}
              >

                {/* IMAGE */}

                <div className="hackathon-image-wrapper">

                  {hackathon.image ? (
                    <img
                      src={hackathon.image}
                      alt={hackathon.title}
                      className="hackathon-image"
                      onError={handleImageError}
                    />
                  ) : null}

                  <div
                    className="hackathon-image-placeholder"
                    style={{
                      display: hackathon.image
                        ? "none"
                        : "flex",
                    }}
                  >
                    <span>🚀</span>
                    <small>HackathonOS</small>
                  </div>

                  <div className="hackathon-image-overlay">
                    <span>
                      {hackathon.mode || "Online"}
                    </span>
                  </div>

                </div>

                {/* CONTENT */}

                <div className="hackathon-card-content">

                  <div className="hackathon-card-top">

                    {hackathon.domains?.slice(0, 2).map(
                      (domain, index) => (
                        <span
                          className="hackathon-domain"
                          key={index}
                        >
                          {domain}
                        </span>
                      )
                    )}

                  </div>

                  <h2>
                    {hackathon.title}
                  </h2>

                  <p className="hackathon-organizer">
                    By {hackathon.organizer}
                  </p>

                  {hackathon.description && (
                    <p className="hackathon-description">
                      {hackathon.description}
                    </p>
                  )}

                  {/* DETAILS */}

                  <div className="hackathon-details">

                    <div className="hackathon-detail-item">
                      <span>📅</span>

                      <div>
                        <small>Event Dates</small>

                        <strong>
                          {formatDate(hackathon.startDate)}
                          {" — "}
                          {formatDate(hackathon.endDate)}
                        </strong>
                      </div>
                    </div>

                    <div className="hackathon-detail-item">
                      <span>📍</span>

                      <div>
                        <small>Location</small>

                        <strong>
                          {hackathon.location ||
                            hackathon.mode ||
                            "Not specified"}
                        </strong>
                      </div>
                    </div>

                    {hackathon.prize && (
                      <div className="hackathon-detail-item">
                        <span>🏆</span>

                        <div>
                          <small>Prize Pool</small>

                          <strong>
                            {hackathon.prize}
                          </strong>
                        </div>
                      </div>
                    )}

                    {hackathon.registrationDeadline && (
                      <div className="hackathon-detail-item">
                        <span>⏰</span>

                        <div>
                          <small>Registration Deadline</small>

                          <strong>
                            {formatDate(
                              hackathon.registrationDeadline
                            )}
                          </strong>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* ACTIONS */}

                  <div className="hackathon-actions">

                    <button
                      className={
                        isApplied
                          ? "hackathon-button applied-button"
                          : "hackathon-button apply-button"
                      }
                      onClick={() =>
                        handleApply(hackathon._id)
                      }
                      disabled={isApplied || isApplying}
                    >
                      {isApplying
                        ? "Applying..."
                        : isApplied
                        ? "✓ Applied"
                        : "Apply Now"}
                    </button>

                    <a
                      href={hackathon.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hackathon-button official-button"
                    >
                      Official Website →
                    </a>

                  </div>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default Hackathons;
