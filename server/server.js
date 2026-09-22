require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("./models/user");
const Hackathon = require("./models/Hackathon");
const TeamRequest = require("./models/TeamRequest");
const Team = require("./models/Team");
const Application = require("./models/Application");
const app = express();

const PORT = 5000;

function isCurrentUser(req, userId) {
  return req.user?.id && req.user.id.toString() === userId.toString();
}

// =========================
// MIDDLEWARE
// =========================

app.use(cors());
app.use(express.json({ limit: "5mb" }));



// =====================================================
// JWT AUTHENTICATION MIDDLEWARE
// =====================================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required."
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT verification error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token."
    });
  }
}

// =========================
// MONGODB CONNECTION
// =========================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });


// =========================
// HOME ROUTE
// =========================

app.get("/", (req, res) => {
  res.send("HackathonOS Backend is running!");
});


// =====================================================
// HACKATHONS
// =====================================================

// GET ALL HACKATHONS

app.get(
  "/api/hackathons",
  authenticateToken,
  async (req, res) => {

  try {

    const hackathons = await Hackathon.find()
      .sort({ startDate: 1 });

    res.json({
      success: true,
      hackathons
    });

  } catch (error) {

    console.error("Hackathon fetch error:", error);

    res.status(500).json({
      success: false,
      message: "Could not fetch hackathons."
    });

  }

});


// ADD NEW HACKATHON

app.post(
  "/api/hackathons",
  authenticateToken,
  async (req, res) => {

  try {

    const {
      title,
      organizer,
      description,
      startDate,
      endDate,
      mode,
      location,
      domains,
      officialUrl,
      image,
      prize,
      registrationDeadline
    } = req.body;

    if (
      !title ||
      !organizer ||
      !startDate ||
      !endDate ||
      !officialUrl
    ) {

      return res.status(400).json({
        success: false,
        message: "Required hackathon fields are missing."
      });

    }

    const hackathon = await Hackathon.create({

      title,
      organizer,
      description,
      startDate,
      endDate,
      mode,
      location,
      domains,
      officialUrl,
      image,
      prize,
      registrationDeadline

    });

    console.log(
      "New hackathon added:",
      hackathon.title
    );

    res.status(201).json({

      success: true,
      message: "Hackathon added successfully!",
      hackathon

    });

  } catch (error) {

    console.error(
      "Hackathon creation error:",
      error
    );

    res.status(500).json({

      success: false,
      message: "Could not create hackathon."

    });

  }

});


// ================= APPLY TO HACKATHON =================

app.post(
  "/api/applications",
  authenticateToken,
  async (req, res) => {
  try {
    const { userId, hackathonId } = req.body;

    if (!userId || !hackathonId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Hackathon ID are required.",
      });
    }

    if (!isCurrentUser(req, userId)) {
      return res.status(403).json({ success: false, message: "You can only apply for yourself." });
    }

    // Check user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check hackathon
    const hackathon = await Hackathon.findById(hackathonId);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found.",
      });
    }

    // Check duplicate application
    const existingApplication = await Application.findOne({
      user: userId,
      hackathon: hackathonId,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to this hackathon.",
      });
    }

    // Create application
    const application = await Application.create({
      user: userId,
      hackathon: hackathonId,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      application,
    });
  } catch (error) {
    console.error("Application error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while applying.",
    });
  }
});

// ================= MY APPLICATIONS =================

app.get(
  "/api/applications/:userId",
  authenticateToken,
  async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isCurrentUser(req, userId)) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const applications = await Application.find({
      user: userId,
    })
      .populate(
        "hackathon",
        "title organizer startDate endDate mode location prize officialUrl image"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("My applications error:", error);

    res.status(500).json({
      success: false,
      message: "Could not load applications.",
    });
  }
});


// =====================================================
// TEST API
// =====================================================

app.get("/api/test", (req, res) => {

  res.json({

    message: "Hello from HackathonOS backend!",
    success: true

  });

});


// =====================================================
// REGISTER
// =====================================================

app.post("/api/register", async (req, res) => {

  try {

    const {
      name,
      email,
      password
    } = req.body;

    if (!name || !email || !password) {

      return res.status(400).json({

        success: false,
        message: "All fields are required."

      });

    }

    const existingUser = await User.findOne({
      email
    });

    if (existingUser) {

      return res.status(400).json({

        success: false,
        message:
          "An account with this email already exists."

      });

    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({

      name,
      email,
      password: hashedPassword

    });

    const token = jwt.sign(
  {
    id: user._id.toString(),
    email: user.email
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "7d"
  }
);

    return res.status(201).json({
  success: true,
  message: "Account created successfully!",
  token,
  userId: user._id,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    profileCompleted: user.profileCompleted
  }
});

  } catch (error) {

    console.error(
      "Registration error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Something went wrong while creating the account."

    });

  }

});


// =====================================================
// LOGIN
// =====================================================

app.post("/api/login", async (req, res) => {
  try {

    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const user = await User.findOne({
      email
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }


    // ============================================
    // CREATE JWT TOKEN
    // ============================================
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );


    // ============================================
    // LOGIN RESPONSE
    // ============================================

    res.json({
      success: true,
      message: "Login successful!",

      token: token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileCompleted: user.profileCompleted
      }
    });

  } catch (error) {

    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while logging in."
    });

  }
});

// =====================================================
// PROFILE
// =====================================================

// GET PROFILE

app.get(
  "/api/profile/:id",
  authenticateToken,
  async (req, res) => {

  try {

    const user =
      await User.findById(req.params.id)
        .select("-password");

    if (!user) {

      return res.status(404).json({

        success: false,
        message:
          "User not found."

      });

    }

    res.json({

      success: true,
      user

    });

  } catch (error) {

    console.error(
      "Get profile error:",
      error
    );

    res.status(500).json({

      success: false,
      message:
        "Could not load profile."

    });

  }

});


// UPDATE PROFILE
app.put(
  "/api/profile/:id",
  authenticateToken,
  async (req, res) => {

  try {

    const { id } = req.params;

    if (!isCurrentUser(req, id)) {
      return res.status(403).json({ success: false, message: "You can only update your own profile." });
    }

    const {
      name,
      college,
      branch,
      year,
      skills,
      experience,
      bio,
      lookingFor,
      github,
      linkedin,
      profilePhoto
    } = req.body;

    const updatedUser =
      await User.findByIdAndUpdate(

        id,

        {
          name,
          college,
          branch,
          year,
          skills,
          experience,
          bio,
          lookingFor,
          github,
          linkedin,
          profilePhoto,
          profileCompleted: true
        },

        {
          new: true
        }

      );

    if (!updatedUser) {

      return res.status(404).json({

        success: false,
        message:
          "User not found."

      });

    }

    res.json({

      success: true,

      message:
        "Profile updated successfully!",

      user: updatedUser

    });

  } catch (error) {

    console.error(
      "Profile update error:",
      error
    );

    res.status(500).json({

      success: false,
      message:
        "Something went wrong while updating profile."

    });

  }

});


// =====================================================
// USERS / TEAMMATES
// =====================================================

// GET ALL USERS

app.get(
  "/api/users",
  authenticateToken,
  async (req, res) => {

  try {

    const users =
      await User.find()
        .select("-password")
        .sort({ createdAt: -1 });

    res.json({

      success: true,
      users

    });

  } catch (error) {

    console.error(
      "Users fetch error:",
      error
    );

    res.status(500).json({

      success: false,
      message:
        "Could not fetch users."

    });

  }

});


// GET TEAMMATES
app.get(
  "/api/teammates",
  authenticateToken,
  async (req, res) => {

  try {

    const users =
      await User.find()
        .select("-password")
        .sort({ createdAt: -1 });

    res.json({

      success: true,
      users

    });

  } catch (error) {

    console.error(
      "Teammates fetch error:",
      error
    );

    res.status(500).json({

      success: false,
      message:
        "Could not fetch teammates."

    });

  }

});


// =====================================================
// TEAM REQUESTS
// =====================================================

// SEND TEAM REQUEST
app.post(
  "/api/team-requests",
  authenticateToken,
  async (req, res) => {

  try {

    const {
      sender,
      receiver
    } = req.body;

    if (!sender || !receiver) {

      return res.status(400).json({

        success: false,
        message:
          "Sender and receiver are required."

      });

    }

    if (!isCurrentUser(req, sender)) {
      return res.status(403).json({ success: false, message: "You can only send requests from your own account." });
    }


    // Cannot request yourself

    if (
      sender.toString() ===
      receiver.toString()
    ) {

      return res.status(400).json({

        success: false,
        message:
          "You cannot send a request to yourself."

      });

    }


    // Check sender exists

    const senderUser =
      await User.findById(sender);

    if (!senderUser) {

      return res.status(404).json({

        success: false,
        message:
          "Sender user not found."

      });

    }


    // Check receiver exists

    const receiverUser =
      await User.findById(receiver);

    if (!receiverUser) {

      return res.status(404).json({

        success: false,
        message:
          "Receiver user not found."

      });

    }


    // Check pending request

    const existingPendingRequest =
      await TeamRequest.findOne({

        sender,
        receiver,
        status: "pending"

      });

    if (existingPendingRequest) {

      return res.status(400).json({

        success: false,
        message:
          "Team request already sent."

      });

    }


    // Check if they are already teammates

    const existingTeam =
      await Team.findOne({

        members: {
          $all: [sender, receiver]
        }

      });

    if (existingTeam) {

      return res.status(400).json({

        success: false,
        message:
          "You are already teammates."

      });

    }


    // Create request

    const teamRequest =
      await TeamRequest.create({

        sender,
        receiver,
        status: "pending"

      });


    console.log(
      "Team request sent:",
      sender.toString(),
      "→",
      receiver.toString()
    );


    res.status(201).json({

      success: true,

      message:
        "Team request sent successfully!",

      request:
        teamRequest

    });

  } catch (error) {

    console.error(
      "Team request error:",
      error
    );

    res.status(500).json({

      success: false,
      message:
        "Could not send team request."

    });

  }

});


// =====================================================
// MY SENT APPLICATIONS
// =====================================================
// =====================================================
// MY SENT TEAM REQUESTS
// =====================================================

app.get(
  "/api/team-requests/sent/:userId",
  authenticateToken,
  async (req, res) => {
  try {
    if (!isCurrentUser(req, req.params.userId)) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }
    const requests = await TeamRequest.find({
      sender: req.params.userId
    })
      .populate(
        "receiver",
        "name email college branch year skills experience bio lookingFor github linkedin profilePhoto"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      requests
    });

  } catch (error) {
    console.error("Sent requests error:", error);

    res.status(500).json({
      success: false,
      message: "Could not fetch sent team requests."
    });
  }
});


// =====================================================
// INCOMING TEAM REQUESTS
// =====================================================

app.get(
  "/api/team-requests/incoming/:userId",
  authenticateToken,
  async (req, res) => {
    try {
      if (!isCurrentUser(req, req.params.userId)) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }
      const requests = await TeamRequest.find({
        receiver: req.params.userId,
        status: "pending"
      })
        .populate(
          "sender",
          "name email college branch year skills experience bio lookingFor github linkedin profilePhoto"
        )
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        requests
      });

    } catch (error) {
      console.error(
        "Incoming requests error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Could not fetch incoming requests."
      });
    }
  }
);
// =====================================================
// ACCEPT / REJECT TEAM REQUEST
// =====================================================
app.put(
  "/api/team-requests/:requestId",
  authenticateToken,
  async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    // Only accepted or rejected allowed
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request status."
      });
    }

    // Find the request
    const request = await TeamRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Team request not found."
      });
    }

    if (request.receiver.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Only the recipient can process this request." });
    }

    // Prevent processing twice
    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request has already been processed."
      });
    }

    const senderId = request.sender;
    const receiverId = request.receiver;

    // =================================================
    // REJECT
    // =================================================

    if (status === "rejected") {
      await TeamRequest.findByIdAndDelete(requestId);

      return res.json({
        success: true,
        message: "Team request rejected."
      });
    }

    // =================================================
    // ACCEPT
    // =================================================

    if (status === "accepted") {

      // -----------------------------------------------
      // Check if they are already teammates
      // -----------------------------------------------

      let existingTeam = await Team.findOne({
        members: {
          $all: [senderId, receiverId]
        }
      });

      // -----------------------------------------------
      // No existing team → create new team
      // -----------------------------------------------

      if (!existingTeam) {
        existingTeam = await Team.create({
          members: [
            senderId,
            receiverId
          ]
        });

        console.log(
          "New team created:",
          existingTeam._id.toString()
        );
      }

      // -----------------------------------------------
      // Existing team → add missing members
      // -----------------------------------------------

      else {
        const memberIds = existingTeam.members.map(
          (member) => member.toString()
        );

        if (!memberIds.includes(senderId.toString())) {
          existingTeam.members.push(senderId);
        }

        if (!memberIds.includes(receiverId.toString())) {
          existingTeam.members.push(receiverId);
        }

        await existingTeam.save();

        console.log(
          "Existing team updated:",
          existingTeam._id.toString()
        );
      }

      // =================================================
      // VERY IMPORTANT
      // REMOVE ALL REQUESTS BETWEEN THESE TWO USERS
      // =================================================

      await TeamRequest.deleteMany({
        $or: [
          {
            sender: senderId,
            receiver: receiverId
          },
          {
            sender: receiverId,
            receiver: senderId
          }
        ]
      });

      console.log(
        "All requests between teammates removed."
      );

      // -----------------------------------------------
      // Response
      // -----------------------------------------------

      return res.json({
        success: true,
        message: "Team created successfully!"
      });
    }

  } catch (error) {

    console.error(
      "Update team request error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Could not update team request."
    });
  }
});

// =====================================================
// GET MY TEAM
// =====================================================

app.get(
  "/api/my-team/:userId",
  authenticateToken,
  async (req, res) => {

    try {

      const { userId } = req.params;

      if (!isCurrentUser(req, userId)) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }

      console.log(
        "================================="
      );

      console.log(
        "MY TEAM REQUEST"
      );

      console.log(
        "User ID:",
        userId
      );

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {

        console.log(
          "Invalid user ID"
        );

        return res.status(400).json({

          success: false,

          message:
            "Invalid user ID."

        });

      }

      // Find team containing user
      const team = await Team.findOne({

        members:
          new mongoose.Types.ObjectId(userId)

      }).populate(

        "members",

        "name email college branch year skills experience bio lookingFor github linkedin profilePhoto"

      );

      console.log(
        "Team found:",
        team
      );

      // No team
      if (!team) {

        return res.json({

          success: true,

          team: null,

          message:
            "You are not part of any team yet."

        });

      }

      console.log(
        "Team members:",
        team.members
      );

      res.json({

        success: true,

        team

      });

    } catch (error) {

      console.error(
        "================================="
      );

      console.error(
        "MY TEAM API ERROR:"
      );

      console.error(
        error
      );

      console.error(
        "================================="
      );

      res.status(500).json({

        success: false,

        message:
          "Could not load your team.",

        error:
          error.message

      });

    }

  }
);

// =====================================================
// START SERVER
// =====================================================

app.listen(
  PORT,
  () => {

    console.log(
      `Server running on http://localhost:${PORT}`
    );

  }
);
