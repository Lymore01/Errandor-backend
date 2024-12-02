const errandModel = require("../../../models/models.errands");
const asyncHandler = require("express-async-handler");
const mongoose = require('mongoose');

exports.getDashboardData = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // For Creator Stats
  const totalErrandsPosted = await errandModel
    .find({ belongsTo: userId })
    .countDocuments();

  const totalPendingErrands = await errandModel
    .find({ belongsTo: userId, status: "Pending" })
    .countDocuments();

  const totalInProgressErrands = await errandModel
    .find({ belongsTo: userId, status: "In Progress" })
    .countDocuments();

  const totalCompletedCreated = await errandModel
    .find({ belongsTo: userId, status: "Completed" })
    .countDocuments();

  const totalCancelledCreated = await errandModel
    .find({ belongsTo: userId, status: "Cancelled" })
    .countDocuments();

  const totalSpent = await errandModel.aggregate([
    {
      $match: {
        belongsTo: userObjectId,
        status: "Completed"
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$reward" }
      }
    }
  ]);

  // For Claimer Stats
  const totalErrandsClaimed = await errandModel
    .find({ claimedErrandor: userId })
    .countDocuments();

  const totalErrandsCompleted = await errandModel
    .find({
      claimedErrandor: userId,
      status: "Completed",
    })
    .countDocuments();

  const totalErrandsApproved = await errandModel
    .find({
      claimedErrandor: userId,
      status: "Approved",
    })
    .countDocuments();

  const totalErrandsCancelled = await errandModel
    .find({
      claimedErrandor: userId,
      status: "Cancelled",
    })
    .countDocuments();

  const totalPendingApproval = await errandModel
    .find({
      claimedErrandor: userId,
      status: "Pending Approval",
    })
    .countDocuments();

  const totalEarnings = await errandModel.aggregate([
    {
      $match: {
        claimedErrandor: userObjectId,
        status: "Completed"
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$reward" }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    message: "Dashboard data fetched successfully!",
    data: {
      creator: {
        totalErrandsPosted,
        totalPendingErrands,
        totalInProgressErrands,
        totalCompletedCreated,
        totalCancelledCreated,
        totalSpent: totalSpent[0]?.total || 0,
      },
      claimer: {
        totalErrandsClaimed,
        totalErrandsCompleted,
        totalErrandsApproved,
        totalErrandsCancelled,
        totalPendingApproval,
        totalEarnings: totalEarnings[0]?.total || 0,
      }
    },
  });
});
