const express = require("express");
const errandRouter = express.Router();
const {
  deleteErrand,
  getErrands,
  getErrandsById,
  postErrand,
  updateErrandById,
} = require("../../controllers/errands/controllers.errands");

errandRouter.get("/all", getErrands);
errandRouter.get("/errand/:id", getErrandsById);
errandRouter.post("/create-errand", postErrand);
errandRouter.put("/update/errand/:id", updateErrandById);
errandRouter.delete("/delete/errand/:id", deleteErrand);

module.exports = errandRouter;
