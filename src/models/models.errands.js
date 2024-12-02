const mongoose = require("mongoose");

const errandSchema = new mongoose.Schema(
  {
    belongsTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    errandName: {
      type: String,
      required: true,
    },
    errandImage: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    county: {
      type: String,
    },
    subCounty: {
      type: String,
    },
    reward: {
      type: Number,
      required: true,
    },
    place: {
      type: String,
    },
    dateTime: {
      type: Date,
    },
    completionTime: {
      type: Date,
    },
    urgency: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Low",
    },
    instructions: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Claimed", "Approved", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
    },
    claimedErrandor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    approvedErrandor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

module.exports = mongoose.model("Errands", errandSchema);
