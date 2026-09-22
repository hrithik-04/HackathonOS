const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    college: {
      type: String,
      default: ""
    },

    branch: {
      type: String,
      default: ""
    },

    year: {
      type: String,
      default: ""
    },

    skills: {
      type: [String],
      default: []
    },

    experience: {
      type: String,
      default: ""
    },

    bio: {
      type: String,
      default: ""
    },

    lookingFor: {
      type: [String],
      default: []
    },

    github: {
      type: String,
      default: ""
    },

    linkedin: {
      type: String,
      default: ""
    },

    profilePhoto: {
      type: String,
      default: ""
    },

    profileCompleted: {
      type: Boolean,
      default: false
    }
  },

  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;