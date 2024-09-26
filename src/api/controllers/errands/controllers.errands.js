const errandModel = require("../../../models/models.errands");
const findSocketByUserId = require("../../../utils/findSocketByUserId");
const app = require("../../../app");
const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");

const io = new Server(server);

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
      belongsTo: req.user._id,
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

exports.claimErrand = async () => {
  const errandId = req.params.id;
  try {
    if (!errandId) {
      return res.status(400).json({ message: "Please provide errand id" });
    }

    const updatedErrand = await errandModel.findOneAndUpdate(
      {
        _id: errandId,
      },
      { $push: { claimedErrandor: req.user._id } },
      { new: true, useFindAndModify: false }
    );

    if (!updatedErrand) {
      return res.json({ message: "Errand not found!" });
    }

    const ownerId = updatedErrand.belongsTo;

    const ownerSocket = findSocketByUserId(ownerId);

    if (ownerSocket) {
      const message = `Your errand has been claimed by user ${userId}`;
      io.to(ownerSocket.id).emit("notification", { message });
    }

    io.on("connection", (socket) => {
      socket.on("status", async ({ status, user }) => {
        await errandModel.findOneAndUpdate(
          {
            _id: errandId,
          },
          {
            $set: {
              status: status,
              approvedErrandor: user,
            },
          },
          {
            new: true,
          }
        );
        io.to(ownerSocket.user).emit(
          "notification",
          `Errand ${errandId} ${status}`
        );
      });
    });

    res.status(200).json({
      message: `Errand ${errandId} claimed successfully!`,
      data: updated,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: `Error claiming errand ${errandId}: ${error.message}` });
  }
};

// TODO: Solve the circular dependency error
