const express = require("express")
const usersRouter = express.Router()
const { loginUser, registerUser,getUser, getUserProfile, updateProfile } = require("../../controllers/users/controllers.users")
const { authenticateToken } = require("../../middleware/auth")
const upload = require('../../../config/multer')

usersRouter.post("/register-user", registerUser);
usersRouter.post("/login-user", loginUser);

usersRouter.use(authenticateToken)

usersRouter.get("/profile", getUserProfile);
usersRouter.put("/update-profile", upload.single('profileImage'), updateProfile);

module.exports = usersRouter;