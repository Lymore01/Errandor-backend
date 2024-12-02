const express = require("express");
const errandRouter = express.Router();
const {
  deleteErrand,
  getErrands,
  getErrandsById,
  postErrand,
  updateErrandById,
  claimErrand,
  cancelClaim,
  getErrandsByUserId,
  getClaimedErrands,
  approveErrand,
  completeErrand,
  markErrandComplete,
} = require("../../controllers/errands/controllers.errands");
const { authenticateToken } = require("../../middleware/auth");
const upload = require('../../../config/multer');

errandRouter.use(authenticateToken);

// Get all errands
errandRouter.get("/all", getErrands);

// Get single errand
errandRouter.get("/errand/:id", getErrandsById);

// Create errand
errandRouter.post("/create", upload.single('errandImage'), postErrand);

// Update errand
errandRouter.put("/update/errand/:id", updateErrandById);

// Delete errand
errandRouter.delete("/delete/errand/:id", deleteErrand);

// Claim errand
errandRouter.post("/claim/errand/:id", claimErrand);

// Cancel claim
errandRouter.put("/cancel-claim/errand/:id", cancelClaim);

// Get user's created errands
errandRouter.get("/user", getErrandsByUserId);

// Get user's claimed errands
errandRouter.get("/claimed", getClaimedErrands);

// Mark errand as complete (by creator)
errandRouter.put("/complete/errand/:id", markErrandComplete);

// Mark claim as complete (by claimer)
errandRouter.put("/complete-claim/errand/:id", completeErrand);

// Approve errand
errandRouter.put("/approve/errand/:id", approveErrand);

module.exports = errandRouter;
