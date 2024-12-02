const socketUsers = new Map();
const io = require("../utils/socket");

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
