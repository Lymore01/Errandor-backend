const app = require("../app")
const http = require("http")
const server = http.createServer(app);

const { Server } = require("socket.io")

module.exports = new Server(server);
