const mongoose = require("mongoose");

const errandSchema = new mongoose.Schema({
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
    enum: ["Pending", "Completed", "Pending", "Cancelled"],
    default: "Pending",
  },
});

module.exports = mongoose.model("Errands", errandSchema);
