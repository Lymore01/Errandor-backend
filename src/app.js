// entry point
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
require("dotenv").config({ path: envFile });
const db = require("./config/config.db");
const express = require("express");
var colors = require("colors/safe");
const cors = require("cors");
const http = require("http");
const bodyParser = require("body-parser");
const userRouter = require("../src/api/routes/users/routes.users");
const errandRouter = require("../src/api/routes/errands/routes.errands");
const dashboardRouter = require("../src/api/routes/dashboard/routes.dashboard");
const errorHandler = require("../src/middlewares/errorHandler");
const { Server } = require("socket.io");
const PORT = process.env.PORT;
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

const io = new Server(server);

io.on("connection", (socket) => {
  console.log(colors.cyan("User connected!"));
  socket.on("register", (userId) => {
    socket.userId = userId;
  });
  socket.on("disconnect", () => {
    console.log(`User with socket ID ${socket.id} disconnected`);
  });
});

// middlewares
app.use(bodyParser.json());
app.use(cors());

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, '../uploads');
const errandsDir = path.join(uploadsDir, 'errands');
const profilesDir = path.join(uploadsDir, 'profiles');

// Ensure directories exist
[uploadsDir, errandsDir, profilesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// routes
app.use("/api/users", userRouter);
app.use("/api/errands", errandRouter);
app.use("/api/dashboard", dashboardRouter);

const startServer = () => {
  app.listen(PORT, () => {
    console.log(colors.cyan(`App Listening on port ${PORT}...`));
  });
};
app.use(errorHandler);

const gracefulShutdown = async () => {
  console.log(colors.yellow("Gracefully shutting down..."));
  try {
    await db.close();
    console.log(
      colors.cyan("MongoDB connection closed through app termination")
    );
  } catch (error) {
    console.log(colors.red("Error closing MongoDB connection:", error));
  } finally {
    process.exit(0);
  }
};

db.once("open", () => {
  console.log(colors.green("Connected to MongoDB."));
  startServer();
});

db.on("error", (err) => {
  console.error(colors.red("Failed to connect to MongoDB:", err));
  process.exit(1); 
});

process.on("SIGINT", gracefulShutdown).on("SIGTERM", gracefulShutdown);
module.exports = app;
