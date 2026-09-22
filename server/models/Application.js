const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same user from applying to the same hackathon twice
applicationSchema.index(
  { user: 1, hackathon: 1 },
  { unique: true }
);

const Application = mongoose.model(
  "Application",
  applicationSchema
);

module.exports = Application;