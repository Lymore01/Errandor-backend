const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      min: [8, 'Password must be at least 8 characters long'],
    },
  },
  {
    timestamps:{ createdAt: "createdAt", updatedAt: "updatedAt"}
  }
);

module.exports = mongoose.model("Users", userSchema);