import { useEffect } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

function Home() {

  useEffect(() => {
  fetch("http://localhost:5000/api/test")
    .then((response) => response.json())
    .then((data) => {
      console.log("Backend Response:", data);
    })
    .catch((error) => {
      console.log("Backend Error:", error);
    });
}, []);

  return (
    <div className="app">

      <Navbar />

      <main className="hero">

        {/* LEFT SIDE */}
        <div className="hero-content">

          <div className="badge">
            🚀 Build your winning team
          </div>

          <h1>
            Find the right people
            <br />
            for your <span>next hackathon.</span>
          </h1>

          <p>
            Discover hackathons, find the right problem statement,
            and connect with teammates whose skills complement yours.
          </p>

          <div className="hero-buttons">

  <Link
    to="/hackathons"
    className="primary-btn"
  >
    Explore Hackathons →
  </Link>

  <Link
    to="/teammates"
    className="secondary-btn"
  >
    Find Teammates
  </Link>

</div>

          <div className="stats">

            <div>
              <strong>500+</strong>
              <span>Hackathons</span>
            </div>

            <div>
              <strong>10K+</strong>
              <span>Students</span>
            </div>

            <div>
              <strong>5K+</strong>
              <span>Connections</span>
            </div>

          </div>

        </div>


        {/* RIGHT SIDE */}
        <div className="hero-visual">

          <div className="match-card">

            <div className="match-header">
              <span>Perfect teammate</span>
              <span className="match-percent">94%</span>
            </div>

            <div className="profile-circle">
              A
            </div>

            <h3>Aman Sharma</h3>

            <p>AI / ML Developer</p>

            <div className="skills">
              <span>Python</span>
              <span>TensorFlow</span>
              <span>ML</span>
            </div>

            <div className="looking">
              <small>Looking for</small>
              <strong>Full Stack Developer</strong>
            </div>

            <div className="match-actions">
              <button>✕</button>
              <button>♥</button>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Home;