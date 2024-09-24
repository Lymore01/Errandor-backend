const mongoose = require("mongoose");
const errandModel = require("../../../models/models.errands");

exports.postErrand = async (req, res) => {
  try {
    const {
      errandName,
      errandImage,
      description,
      county,
      subCounty,
      place,
      dateTime,
      completionTime,
      urgency,
      instructions,
      status,
    } = req.body;
    const errand = new errandModel({
      errandName,
      errandImage,
      description,
      county,
      subCounty,
      place,
      dateTime,
      completionTime,
      urgency,
      instructions,
      status,
    });
    await errand.save();
    res.status(200).json({ message: "Errand posted successfully!" });
  } catch (error) {
    res
      .status(400)
      .json({ message: `Error while posting errand: ${error.message}` });
  }
};
exports.getErrands = async (req, res) => {
  try {
    const errands = await errandModel.find({});
    if (!errands) {
      return res.status(400).json({ message: "Errands not found" });
    }
    res.status(200).json({
      message: "Errands fetched successfully!",
      data: errands,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: `Error getting errands: ${error.message}` });
  }
};
exports.getErrandsById = async (req, res) => {
  const errandId = req.params.id;
  try {
    if (!errandId) {
      return res.status(400).json({ message: "Please provide errand id" });
    }
    const errand = await errandModel.findById(errandId);
    if (!errand) {
      return res
        .status(400)
        .json({ message: `Errands by id ${errandId} not found!` });
    }
    res.status(200).json({
      message: `Errand ${errandId} fetched successfully!`,
      data: errand,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: `Error getting errand ${errandId}: ${error.message}` });
  }
};

exports.deleteErrand = async (req, res) => {
  const errandId = req.params.id;
  try {
    if (!errandId) {
      return res.status(400).json({ message: "Please provide errand id" });
    }
    await errandModel.findByIdAndDelete(errandId);
    res.status(200).json({
      message: `Errand ${errandId} deleted successfully!`,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: `Error deleting errand ${errandId}: ${error.message}` });
  }
};

exports.updateErrandById = async (req, res) => {
  const errandId = req.params.id;
  try {
    if (!errandId) {
      return res.status(400).json({ message: "Please provide errand id" });
    }
    const updatedErrand = {
      errandName: req.body.errandName,
      errandImage: req.body.errandImage,
      description: req.body.description,
      county: req.body.county,
      subCounty: req.body.subCounty,
      place: req.body.place,
      dateTime: req.body.dateTime,
      completionTime: req.body.completionTime,
      urgency: req.body.urgency,
      instructions: req.body.instructions,
      status: req.body.status,
    };
    const updated = await errandModel.findOneAndUpdate(
      { _id: errandId },
      {
        $set: updatedErrand,
      },
      {
        new: true,
      }
    );
    res.status(200).json({
      message: `Errand ${errandId} updated successfully!`,
      data: updated,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: `Error updating errand ${errandId}: ${error.message}` });
  }
};
