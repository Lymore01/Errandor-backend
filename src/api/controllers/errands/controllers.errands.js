const errandModel = require("../../../models/models.errands");
const findSocketByUserId = require("../../../utils/findSocketByUserId");
const io = require("../../../utils/socket");
const asyncHandler = require("express-async-handler");

exports.postErrand = asyncHandler(async (req, res) => {
  const {
    errandName,
    description,
    county,
    subCounty,
    reward,
    place,
    dateTime,
    completionTime,
    urgency,
    instructions,
    status,
  } = req.body;

  const errandImage = req.file ? `/uploads/errands/${req.file.filename}` : null;

  const errand = new errandModel({
    belongsTo: req.user.userId,
    errandName,
    errandImage,
    description,
    county,
    subCounty,
    reward,
    place,
    dateTime,
    completionTime,
    urgency,
    instructions,
    status: status || 'Pending',
  });

  await errand.save();
  res.status(201).json({ 
    message: "Errand posted successfully!",
    data: errand 
  });
});

exports.getErrands = asyncHandler(async (req, res) => {
  const errands = await errandModel.find({})
    .populate('belongsTo', 'firstName lastName email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    message: "Errands fetched successfully!",
    data: errands,
  });
});

exports.getErrandsById = asyncHandler(async (req, res) => {
  const errandId = req.params.id;
  
  const errand = await errandModel.findById(errandId)
    .populate('belongsTo', 'firstName lastName email')
    .populate('claimedErrandor', 'firstName lastName email');
    
  if (!errand) {
    return res.status(404).json({ message: "Errand not found!" });
  }

  res.status(200).json({
    message: "Errand fetched successfully!",
    data: errand
  });
});

exports.deleteErrand = asyncHandler(async (req, res) => {
  const errandId = req.params.id;
  const userId = req.user.userId;

  const errand = await errandModel.findOne({ 
    _id: errandId,
    belongsTo: userId
  });

  if (!errand) {
    return res.status(404).json({ 
      message: "Errand not found or you don't have permission to delete it" 
    });
  }

  await errandModel.findByIdAndDelete(errandId);
  res.status(200).json({
    message: "Errand deleted successfully!"
  });
});

exports.updateErrandById = asyncHandler(async (req, res) => {
  const errandId = req.params.id;
  const userId = req.user.userId;

  const errand = await errandModel.findOne({
    _id: errandId,
    belongsTo: userId
  });

  if (!errand) {
    return res.status(404).json({ 
      message: "Errand not found or you don't have permission to update it" 
    });
  }

  const updateData = {
    ...req.body,
    belongsTo: userId
  };
  
  if (req.file) {
    updateData.errandImage = `/uploads/errands/${req.file.filename}`;
  }

  const updatedErrand = await errandModel.findOneAndUpdate(
    { _id: errandId },
    { $set: updateData },
    { new: true }
  ).populate('belongsTo', 'firstName lastName');

  res.status(200).json({
    message: "Errand updated successfully!",
    data: updatedErrand
  });
});

exports.claimErrand = asyncHandler(async (req, res) => {
  const errandId = req.params.id;
  const userId = req.user.userId;

  const errand = await errandModel.findById(errandId);
  
  if (!errand) {
    return res.status(404).json({ message: "Errand not found!" });
  }

  if (errand.belongsTo.toString() === userId) {
    return res.status(400).json({ 
      message: "You cannot claim your own errand" 
    });
  }

  if (errand.status !== 'Pending') {
    return res.status(400).json({ 
      message: "This errand is not available for claiming" 
    });
  }

  if(errand.claimedErrandor.length !== 0){
    return res.status(404).json({ message: "This errand is already claimed!" });
  }

  const updatedErrand = await errandModel.findOneAndUpdate(
    { _id: errandId },
    { 
      $push: { claimedErrandor: userId },
      $set: { status: 'Claimed' }
    },
    { new: true }
  ).populate('belongsTo', 'firstName lastName');

  const ownerSocket = findSocketByUserId(errand.belongsTo);
  if (ownerSocket) {
    io.to(ownerSocket.id).emit("notification", {
      type: "ERRAND_CLAIMED",
      message: `Your errand "${errand.errandName}" has been claimed and is waiting for your approval`,
      errandId: errandId
    });
  }

  res.status(200).json({
    message: "Errand claimed successfully! Waiting for owner approval.",
    data: updatedErrand
  });
});

exports.cancelErrand = asyncHandler(async (req, res) => {
  const errandId = req.params.id;
  const userId = req.user.userId;

  if (!errandId) {
    return res.status(400).json({
      message: "Please provide an errand id",
    });
  }

  // Find the errand
  const errand = await errandModel.findById(errandId);

  if (!errand) {
    return res.status(404).json({ 
      message: "Errand not found" 
    });
  }

  // Check if user is owner or claimer
  const isOwner = errand.belongsTo.toString() === userId;
  const isClaimer = errand.claimedErrandor.some(
    claimerId => claimerId.toString() === userId
  );

  if (!isOwner && !isClaimer) {
    return res.status(403).json({ 
      message: "You don't have permission to cancel this errand" 
    });
  }

  const updatedErrand = await errandModel.findOneAndUpdate(
    { _id: errandId },
    {
      $set: {
        status: "Pending",
      },
      $unset: {
        claimedErrandor: 1 
      }
    },
    {
      new: true,
    }
  );

  // Send notifications
  if (isClaimer) {
    const ownerSocket = findSocketByUserId(errand.belongsTo);
    if (ownerSocket) {
      io.to(ownerSocket.id).emit("notification", {
        type: "ERRAND_CANCELLED",
        message: `Your errand "${errand.errandName}" has been cancelled by the claimer`,
        errandId: errandId
      });
    }
  } else {
    if (errand.claimedErrandor && errand.claimedErrandor.length > 0) {
      const claimerSocket = findSocketByUserId(errand.claimedErrandor[0]);
      if (claimerSocket) {
        io.to(claimerSocket.id).emit("notification", {
          type: "ERRAND_CANCELLED",
          message: `The errand "${errand.errandName}" has been cancelled by the owner`,
          errandId: errandId
        });
      }
    }
  }

  res.status(200).json({
    message: `Errand ${errandId} cancelled successfully!`,
    data: updatedErrand
  });
});

exports.getErrandsByUserId = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const errands = await errandModel.find({ belongsTo: userId })
    .populate('belongsTo', 'firstName lastName email')
    .sort({ createdAt: -1 });

  if (!errands.length) {
    return res.status(200).json({
      message: "No errands found for this user",
      data: []
    });
  }

  res.status(200).json({
    message: "User errands fetched successfully!",
    data: errands
  });
});

exports.getClaimedErrands = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const claimedErrands = await errandModel.find({
    claimedErrandor: userId,
    status: { $in: ['Claimed', 'In Progress'] } // Only get active claims
  })
    .populate('belongsTo', 'firstName lastName email')
    .sort({ createdAt: -1 });

  if (!claimedErrands.length) {
    return res.status(200).json({
      message: "No claimed errands found",
      data: []
    });
  }

  res.status(200).json({
    message: "Claimed errands fetched successfully!",
    data: claimedErrands
  });
});

exports.approveErrand = asyncHandler(async (req, res) => {
  const errandId = req.params.id;
  const userId = req.user.userId;

  const errand = await errandModel.findById(errandId);
  
  if (!errand) {
    return res.status(404).json({ message: "Errand not found!" });
  }

  // Check if user is the owner
  if (errand.belongsTo.toString() !== userId) {
    return res.status(403).json({ 
      message: "Only the errand owner can approve claims" 
    });
  }

  // Check if errand is claimed
  if (errand.status !== 'Claimed') {
    return res.status(400).json({ 
      message: "This errand must be claimed before it can be approved" 
    });
  }

  // Get the claimer's ID
  const claimerId = errand.claimedErrandor[0];

  const updatedErrand = await errandModel.findOneAndUpdate(
    { _id: errandId },
    { 
      $set: { 
        status: 'Approved',
        approvedErrandor: claimerId
      }
    },
    { new: true }
  ).populate('belongsTo claimedErrandor', 'firstName lastName');

  // Notify claimer of approval
  const claimerSocket = findSocketByUserId(claimerId);
  if (claimerSocket) {
    io.to(claimerSocket.id).emit("notification", {
      type: "ERRAND_APPROVED",
      message: `Your claim for errand "${errand.errandName}" has been approved!`,
      errandId: errandId
    });
  }

  res.status(200).json({
    message: "Errand approved successfully!",
    data: updatedErrand
  });
});

exports.getApprovedErrands = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const approvedErrands = await errandModel.find({
    claimedErrandor: userId,
    approvedErrandor: userId,
    status: 'Approved'
  })
    .populate('belongsTo', 'firstName lastName email')
    .sort({ createdAt: -1 });

  if (!approvedErrands.length) {
    return res.status(200).json({
      message: "No approved errands found",
      data: []
    });
  }

  res.status(200).json({
    message: "Approved errands fetched successfully!",
    data: approvedErrands
  });
});

exports.getApprovedErrandsByOwner = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const approvedErrands = await errandModel.find({
    belongsTo: userId,
    status: { $in: ['Approved', 'In Progress'] },
    approvedErrandor: { $exists: true }
  })
    .populate('approvedErrandor', 'firstName lastName email')
    .populate('claimedErrandor', 'firstName lastName email')
    .sort({ updatedAt: -1 });

  if (!approvedErrands.length) {
    return res.status(200).json({
      message: "No approved errands found",
      data: []
    });
  }

  res.status(200).json({
    message: "Approved errands fetched successfully!",
    data: approvedErrands
  });
});

// Mark errand as complete by creator
exports.markErrandComplete = asyncHandler(async (req, res) => {
  const errandId = req.params.id;
  const userId = req.user.userId;

  const errand = await errandModel.findById(errandId);
  
  if (!errand) {
    return res.status(404).json({ message: "Errand not found!" });
  }

  // Check if user is the owner
  if (errand.belongsTo.toString() !== userId) {
    return res.status(403).json({ 
      message: "Only the errand owner can mark it as complete" 
    });
  }

  // Check if errand is in correct status
  if (errand.status !== 'In Progress') {
    return res.status(400).json({ 
      message: "Only in-progress errands can be marked as complete" 
    });
  }

  const updatedErrand = await errandModel.findOneAndUpdate(
    { _id: errandId },
    { $set: { status: 'Completed' } },
    { new: true }
  ).populate('belongsTo claimedErrandor', 'firstName lastName');

  // Notify claimer
  const claimerSocket = findSocketByUserId(errand.claimedErrandor[0]);
  if (claimerSocket) {
    io.to(claimerSocket.id).emit("notification", {
      type: "ERRAND_COMPLETED",
      message: `The errand "${errand.errandName}" has been marked as complete by the owner`,
      errandId: errandId
    });
  }

  res.status(200).json({
    message: "Errand marked as complete successfully!",
    data: updatedErrand
  });
});


exports.completeErrand = asyncHandler(async (req, res) => {
  const errandId = req.params.id;
  const userId = req.user.userId;

  const errand = await errandModel.findById(errandId);
  
  if (!errand) {
    return res.status(404).json({ message: "Errand not found!" });
  }

  
  if (!errand.claimedErrandor.includes(userId)) {
    return res.status(403).json({ 
      message: "Only the claimer can mark their work as complete" 
    });
  }

  
  if (errand.status !== 'Approved') {
    return res.status(400).json({ 
      message: "Only approved errands can be marked as complete" 
    });
  }

  const updatedErrand = await errandModel.findOneAndUpdate(
    { _id: errandId },
    { $set: { status: 'In Progress' } },
    { new: true }
  ).populate('belongsTo claimedErrandor', 'firstName lastName');

  // Notify owner
  const ownerSocket = findSocketByUserId(errand.belongsTo);
  if (ownerSocket) {
    io.to(ownerSocket.id).emit("notification", {
      type: "ERRAND_COMPLETION_REQUEST",
      message: `The claimer has completed the errand "${errand.errandName}" and is waiting for your confirmation`,
      errandId: errandId
    });
  }

  res.status(200).json({
    message: "Errand completion request sent successfully!",
    data: updatedErrand
  });
});

// Cancel claim
exports.cancelClaim = asyncHandler(async (req, res) => {
  const errandId = req.params.id;
  const userId = req.user.userId;

  const errand = await errandModel.findById(errandId);
  
  if (!errand) {
    return res.status(404).json({ message: "Errand not found!" });
  }

  // Check if user is the claimer
  if (!errand.claimedErrandor.includes(userId)) {
    return res.status(403).json({ 
      message: "Only the claimer can cancel their claim" 
    });
  }

  // Check if errand can be cancelled
  if (!['Claimed', 'Approved'].includes(errand.status)) {
    return res.status(400).json({ 
      message: "This errand cannot be cancelled in its current state" 
    });
  }

  const updatedErrand = await errandModel.findOneAndUpdate(
    { _id: errandId },
    { 
      $set: { status: 'Pending' },
      $pull: { claimedErrandor: userId },
      $unset: { approvedErrandor: "" }
    },
    { new: true }
  ).populate('belongsTo', 'firstName lastName');

  // Notify owner
  const ownerSocket = findSocketByUserId(errand.belongsTo);
  if (ownerSocket) {
    io.to(ownerSocket.id).emit("notification", {
      type: "CLAIM_CANCELLED",
      message: `The claim for errand "${errand.errandName}" has been cancelled by the claimer`,
      errandId: errandId
    });
  }

  res.status(200).json({
    message: "Claim cancelled successfully!",
    data: updatedErrand
  });
});

/* 
const BottomNavItems = [
  {
    name: "Home",
    icon: "home",
    screen: "HomeScreen",
    // Shows all available errands, featured errands, nearby errands
  },
  {
    name: "My Errands",
    icon: "list-alt",
    screen: "MyErrandsScreen",
    // Shows errands created by the user and errands claimed by the user
    // Could have tabs for:
    // - Created Errands
    // - Claimed Errands
  },
  {
    name: "Create",
    icon: "plus-circle",
    screen: "CreateErrandScreen",
    // Form to create new errand
  },
  {
    name: "Notifications",
    icon: "bell",
    screen: "NotificationsScreen",
    // Shows:
    // - When someone claims your errand
    // - Updates on claimed errands
    // - Status changes
    // - Messages
  },
  {
    name: "Profile",
    icon: "user",
    screen: "ProfileScreen",
    // Shows:
    // - User info
    // - Settings
    // - History
    // - Ratings/Reviews
    // - Logout
  }
];
Explanation of each tab:
Home
Main feed of available errands
Search and filter options
Map view of nearby errands
Categories/Quick filters
My Errands
Tab view switching between:
Errands you created
Errands you claimed
Status indicators
Quick actions (edit, cancel, complete)
Create
Central button for creating new errands
Quick and easy errand creation form
Option to add images
Location selection
Notifications
Real-time updates about your errands
Claims on your errands
Status changes
Messages from claimers/creators
System notifications
Profile
Personal information
Performance stats
Transaction history
Settings
Help/Support
Logout
This structure:
Provides easy access to core features
Separates personal errands from browsing
Keeps notifications visible
Makes creation easily accessible
Maintains profile management
The navigation should be intuitive and allow users to quickly switch between creating errands and claiming others' errands while keeping track of all their activities.
*/


// Todo: create a function where a user can view the total revenue, pending errands, claimed errands, cancelled errands, completed errands