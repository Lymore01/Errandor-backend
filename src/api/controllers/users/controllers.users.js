const usersModel = require("../../../models/models.users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const errandModel = require("../../../models/models.errands");

exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await usersModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new usersModel({
      firstName: firstName,
      lastName: lastName,
      fullName: `${firstName} ${lastName}`,
      email: email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res
      .status(400)
      .json({ message: `Error while registering user: ${error.message}` });
  }
};

exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Find user
  const user = await usersModel.findOne({ email });
  if (!user) {
    return res.status(401).json({ 
      message: "Invalid email or password" 
    });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ 
      message: "Invalid email or password" 
    });
  }

  // Generate token
  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_ACCESS_TOKEN,
    { expiresIn: "30m" }
  );

  res.status(200).json({
    success: true,
    message: "Login successful",
    AccessToken: accessToken,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    }
  });
});

exports.getUser = async (req, res) => {
  const user_id = req.user.userId;
  const user = await usersModel.findById(user_id);
  res.json({ message: "hello", userData: user });
};

exports.getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  
  const user = await usersModel.findById(userId)
    .select('-password'); 

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  const stats = await errandModel.aggregate([
    {
      $facet: {
        "created": [
          { $match: { belongsTo: user._id } },
          { $count: "total" }
        ],
        "claimed": [
          { $match: { claimedErrandor: user._id } },
          { $count: "total" }
        ],
        "completed": [
          { 
            $match: { 
              $or: [
                { belongsTo: user._id, status: "Completed" },
                { claimedErrandor: user._id, status: "Completed" }
              ]
            }
          },
          { $count: "total" }
        ],
        "totalEarnings": [
          { 
            $match: { 
              claimedErrandor: user._id,
              status: "Completed"
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$reward" }
            }
          }
        ],
        "totalSpent": [
          { 
            $match: { 
              belongsTo: user._id,
              status: "Completed"
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$reward" }
            }
          }
        ]
      }
    }
  ]);

  
  const formattedStats = {
    created: stats[0].created[0]?.total || 0,
    claimed: stats[0].claimed[0]?.total || 0,
    completed: stats[0].completed[0]?.total || 0,
    totalEarnings: stats[0].totalEarnings[0]?.total || 0,
    totalSpent: stats[0].totalSpent[0]?.total || 0,
  };

  res.status(200).json({
    success: true,
    message: "Profile fetched successfully",
    data: {
      user,
      stats: formattedStats
    }
  });
});

// Update profile endpoint
exports.updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { firstName, lastName, email } = req.body;

  const user = await usersModel.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

 
  if (req.file) {
    user.profileImage = `/uploads/profiles/${req.file.filename}`;
  }

  
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email) user.email = email;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: user
  });
});

// crypto.randomUUID(64).toString('hex')
