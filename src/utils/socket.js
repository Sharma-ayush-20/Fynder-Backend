const socket = require("socket.io");
const crypto = require("crypto");
const chatModel = require("../models/chat-models");

//create a hash room id
const generateRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const onlineUsers = new Set();

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
      socket.userId = userId;
      socket.join(roomId);
    });

    socket.on("sendMessage", async ({ userId, targetUserId, text }) => {
      try {
        const roomId = generateRoomId(userId, targetUserId);

        let chat = await chatModel.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        if (!chat) {
          chat = new chatModel({
            participants: [userId, targetUserId],
            messages: [],
          });
        }

        chat.messages.push({
          senderId: userId,
          text,
        });

        await chat.save();

        io.to(roomId).emit("messageReceived", {
          senderId: userId,
          text,
        });
      } catch (error) {
        console.log("error in sending message", error.message);
      }
    });

    //for online user
    socket.on("userOnline", (userId) => {
      onlineUsers.add(userId);
      io.emit("updateOnlineUsers", Array.from(onlineUsers));
    });

    //for offline user
    socket.on("disconnect", () => {
      // kisi bhi random user ko remove na ho, isliye socket.userId use karte hain
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit("updateOnlineUsers", Array.from(onlineUsers));
      }
    });
  });
};

module.exports = initializeSocket;
