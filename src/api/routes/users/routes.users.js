const express = require("express")
const usersRouter = express.Router()
const { loginUser, registerUser,getUser } = require("../../controllers/users/controllers.users")
const authenticateAccessToken = require("../../../middlewares/users/middleware.authenticateAccessToken");


usersRouter.post("/register-user", registerUser);
usersRouter.post("/login-user", loginUser);
usersRouter.get("/name", authenticateAccessToken, getUser);

module.exports = usersRouter;