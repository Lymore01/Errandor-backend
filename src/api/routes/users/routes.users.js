const express = require("express")
const usersRouter = express.Router()
const { loginUser, registerUser } = require("../../controllers/users/controllers.users")

usersRouter.post("/register-user", registerUser);
usersRouter.post("/login-user", loginUser);

module.exports = usersRouter;