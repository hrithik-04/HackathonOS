const mongoose = require("mongoose");

const hackathonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    organizer: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    mode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      default: "Online"
    },

    location: {
      type: String,
      default: ""
    },

    domains: {
      type: [String],
      default: []
    },

    officialUrl: {
      type: String,
      required: true
    },

    image: {
      type: String,
      default: ""
    },

    prize: {
      type: String,
      default: ""
    },

    registrationDeadline: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const Hackathon = mongoose.model("Hackathon", hackathonSchema);

module.exports = Hackathon;