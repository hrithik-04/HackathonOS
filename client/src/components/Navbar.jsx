import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">

      <Link to="/" className="logo">
        Hackathon<span>OS</span>
      </Link>

      <div className="nav-links">

        <Link to="/">
          Home
        </Link>

        <Link to="/hackathons">
          Hackathons
        </Link>

        <Link to="/teammates">
          Find Teammates
        </Link>

      </div>

      <div className="nav-buttons">

        <Link to="/login" className="login-btn">
          Log in
        </Link>

        <Link to="/register" className="signup-btn">
          Sign up
        </Link>

      </div>

    </nav>
  );
}

export default Navbar;