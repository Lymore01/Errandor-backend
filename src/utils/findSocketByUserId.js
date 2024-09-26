const socketUsers = new Map();
const app = require("../app")
const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io")

const io = new Server(server);

io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    socketUsers.set(userId, socket);
  });

  socket.on("disconnect", () => {
    socketUsers.delete(socket.userId);
  });
  
});

const findSocketByUserId = (userId) => {
  return socketUsers.get(userId);
};

module.exports = findSocketByUserId;
