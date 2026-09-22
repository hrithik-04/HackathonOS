import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      console.log("Backend Response:", data);

      if (data.success) {
        // Save logged-in user
        //localStorage.setItem(
          //"user",
          //JSON.stringify(data.user)
        //);

//         localStorage.setItem("token", data.token);
        

// localStorage.setItem(
//   "user",
//   JSON.stringify({
//     id: data.user.id,
//     name: data.user.name,
//     email: data.user.email,
//     profileCompleted: data.user.profileCompleted
//   })
// );
localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect based on profile status
       if (data.user.profileCompleted === true) {
  navigate("/dashboard");
} else {
  navigate("/profile");
}
      } else {
        setError(
          data.message ||
            "Invalid email or password."
        );
      }
    } catch (error) {
      console.error("Login Error:", error);

      setError(
        "Could not connect to server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* LEFT SIDE */}

      <div className="auth-brand">

        <div className="auth-brand-content">

          <div className="auth-logo">
            🚀
          </div>

          <h1>
            Hackathon<span>OS</span>
          </h1>

          <p>
            Your complete platform to discover
            hackathons, build teams and turn ideas
            into reality.
          </p>

          <div className="auth-features">

            <div>
              <span>🚀</span>
              <div>
                <strong>Discover Hackathons</strong>
                <small>
                  Find opportunities that match your
                  skills.
                </small>
              </div>
            </div>

            <div>
              <span>🤝</span>
              <div>
                <strong>Build Your Team</strong>
                <small>
                  Connect with talented developers.
                </small>
              </div>
            </div>

            <div>
              <span>🏆</span>
              <div>
                <strong>Win Together</strong>
                <small>
                  Turn your ideas into winning
                  projects.
                </small>
              </div>
            </div>

          </div>

        </div>

      </div>


      {/* RIGHT SIDE */}

      <div className="auth-form-section">

        <div className="auth-form-container">

          <div className="auth-mobile-logo">
            🚀
          </div>

          <div className="auth-heading">

            <h2>
              Welcome back 👋
            </h2>

            <p>
              Sign in to continue to HackathonOS.
            </p>

          </div>


          {/* ERROR */}

          {error && (
            <div className="auth-error">
              ⚠️ {error}
            </div>
          )}


          <form onSubmit={handleLogin}>

            {/* EMAIL */}

            <div className="auth-field">

              <label>
                Email Address
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  ✉️
                </span>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="email"
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="auth-field">

              <div className="auth-label-row">

                <label>
                  Password
                </label>

              </div>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  🔒
                </span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>

              </div>

            </div>


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In →
                </>
              )}
            </button>

          </form>


          {/* REGISTER */}

          <div className="auth-switch">

            <span>
              Don't have an account?
            </span>

            <button
              onClick={() => navigate("/register")}
            >
              Create Account
            </button>

          </div>


          <button
            className="auth-back-home"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>

        </div>

      </div>

    </div>
  );
}

export default Login;