const express = require("express");
const dashboardRouter = express.Router();
const {
  getDashboardData,
} = require("../../controllers/dashboard/controllers.dashboard");
const { authenticateToken } = require("../../middleware/auth");

dashboardRouter.use(authenticateToken);

dashboardRouter.get("/", getDashboardData);

module.exports = dashboardRouter;
