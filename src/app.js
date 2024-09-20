// entry point
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
require("dotenv").config({ path: envFile });
const db = require("./config/config.db");
const express = require("express");
var colors = require("colors/safe");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRouter = require("../src/api/routes/users/routes.users");
const PORT = process.env.PORT;

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
};

// middlewares
app.use(bodyParser.json());
app.use(cors(corsOptions));

// routes
app.use("/api/users", userRouter);

const startServer = () => {
  app.listen(PORT, () => {
    console.log(colors.cyan(`App Listening on port ${PORT}...`));
  });
};

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
    process.exit(0); //close without an error code
  }
};

// start the server only if the db connection is established
db.once("open", () => {
  console.log(colors.green("Connected to MongoDB."));
  startServer();
});

db.on("error", (err) => {
  console.error(colors.red("Failed to connect to MongoDB:", err));
  process.exit(1); // Exit the process with an error code
});

process.on("SIGINT", gracefulShutdown).on("SIGTERM", gracefulShutdown);
