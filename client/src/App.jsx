import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import MyProfile from "./pages/MyProfile";
import Hackathons from "./pages/Hackathons";
import AddHackathons from "./pages/AddHackathons";
import Teammates from "./pages/Teammates";
import MyApplications from "./pages/MyApplications";
import MyTeam from "./pages/MyTeam";
import TeamRequests from "./pages/TeamRequests";


// ======================================================
// PROTECTED ROUTE
// ======================================================

function ProtectedRoute({ children }) {
  const savedUser = localStorage.getItem("user");

  if (!savedUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


// ======================================================
// PROFILE ROUTE
// ======================================================

function ProfileRoute() {
  const savedUser = localStorage.getItem("user");
  const newUserId = localStorage.getItem("newUserId");

  // New user coming from registration
  if (!savedUser && !newUserId) {
    return <Navigate to="/login" replace />;
  }

  return <Profile />;
}


// ======================================================
// APP
// ======================================================

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            PUBLIC HOME
        ================================================= */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* =================================================
            AUTH
        ================================================= */}

<Route
  path="/login"
  element={<Login />}
/>

<Route
  path="/register"
  element={<Register />}
/>


        {/* =================================================
            PROFILE
        ================================================= */}

        <Route
          path="/profile"
          element={
            <ProfileRoute />
          }
        />

        <Route
          path="/my-profile"
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teammate/:id"
          element={<ProtectedRoute><MyProfile /></ProtectedRoute>}
        />


        {/* =================================================
            DASHBOARD
        ================================================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            HACKATHONS
        ================================================= */}

        <Route
          path="/hackathons"
          element={
            <ProtectedRoute>
              <Hackathons />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-hackathon"
          element={
            <ProtectedRoute>
              <AddHackathons />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            TEAMMATES
        ================================================= */}

        <Route
          path="/teammates"
          element={
            <ProtectedRoute>
              <Teammates />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            APPLICATIONS
        ================================================= */}

        <Route
          path="/my-applications"
          element={
            <ProtectedRoute>
              <MyApplications />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            MY TEAM
        ================================================= */}

        <Route
          path="/my-team"
          element={
            <ProtectedRoute>
              <MyTeam />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            TEAM REQUESTS
        ================================================= */}

        <Route
          path="/team-requests"
          element={
            <ProtectedRoute>
              <TeamRequests />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            UNKNOWN URL
        ================================================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
