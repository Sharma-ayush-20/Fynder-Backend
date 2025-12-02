const socket = require("socket.io");
const crypto = require("crypto");

//create a hash room id
const generateRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    //handle events

    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      //create room
      const roomId = generateRoomId(userId, targetUserId);
      console.log(`${firstName} join this ${roomId}`);
      socket.join(roomId);
    });

    socket.on("sendMessage", ({ firstName, userId, targetUserId, text }) => {
      const roomId = generateRoomId(userId, targetUserId);
      console.log(`${firstName}: ${text}`);
      io.to(roomId).emit("messageReceived", { firstName, text });
    });

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
