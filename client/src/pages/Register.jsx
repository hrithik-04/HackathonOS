import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        localStorage.removeItem("user");
localStorage.setItem("token", data.token);
        localStorage.setItem(
          "newUserId",
          data.userId
        );

        navigate("/profile");
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        "Could not connect to backend. Make sure the server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">

      {/* LEFT BRAND PANEL */}
      <div className="register-brand">

        <button
          className="register-back-home"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>

        <div className="register-brand-content">

          <div className="register-logo">
            <span>🚀</span>
            <strong>HackathonOS</strong>
          </div>

          <div className="register-brand-main">

            <div className="register-badge">
              ✦ BUILT FOR HACKATHONERS
            </div>

            <h1>
              Find your people.
              <br />
              <span>Build something</span>
              <br />
              amazing.
            </h1>

            <p>
              Discover hackathons, connect with talented
              teammates and turn your ideas into reality.
            </p>

          </div>

          <div className="register-stats">

            <div>
              <strong>⚡</strong>
              <span>Discover</span>
              <small>Hackathons</small>
            </div>

            <div>
              <strong>🤝</strong>
              <span>Connect</span>
              <small>With Teammates</small>
            </div>

            <div>
              <strong>🏆</strong>
              <span>Create</span>
              <small>Great Projects</small>
            </div>

          </div>

        </div>

      </div>


      {/* RIGHT FORM */}
      <div className="register-form-area">

        <div className="register-form-card">

          <div className="register-mobile-logo">
            🚀 <strong>HackathonOS</strong>
          </div>

          <div className="register-heading">

            <span>CREATE ACCOUNT</span>

            <h2>
              Welcome to HackathonOS
            </h2>

            <p>
              Create your account and start building your
              hackathon journey.
            </p>

          </div>

          {error && (
            <div className="register-error">
              <span>⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* NAME */}
            <div className="register-field">

              <label htmlFor="register-name">
                Full Name
              </label>

              <div className="register-input">
                <span>👤</span>

                <input
                  id="register-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  autoComplete="name"
                />
              </div>

            </div>


            {/* EMAIL */}
            <div className="register-field">

              <label htmlFor="register-email">
                Email Address
              </label>

              <div className="register-input">
                <span>✉</span>

                <input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                />
              </div>

            </div>


            {/* PASSWORD */}
            <div className="register-field">

              <div className="register-label-row">
                <label htmlFor="register-password">
                  Password
                </label>

                <small>
                  6+ characters
                </small>
              </div>

              <div className="register-input">

                <span>🔒</span>

                <input
                  id="register-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "🙈" : "👁"}
                </button>

              </div>

            </div>


            {/* SUBMIT */}
            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="register-spinner"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <span>→</span>
                </>
              )}
            </button>

          </form>


          <div className="register-login">

            <span>
              Already have an account?
            </span>

            <button
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>

          </div>

          <p className="register-note">
            By creating an account, you agree to use
            HackathonOS responsibly.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;