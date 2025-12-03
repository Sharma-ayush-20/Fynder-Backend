const express = require("express");
const chatModel = require("../models/chat-models.js");
const { userAuth } = require("../middlewares/auth.js");
const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user._id;

    if (!userId || !targetUserId) {
      return res.status(400).json({ message: "Id is missing" });
    }

    let chat = await chatModel
      .findOne({
        participants: { $all: [userId, targetUserId] },
      })
      .populate("participants")
      .populate("messages.senderId", "firstName lastName photoUrl");

    if (!chat) {
      return res.status(200).json({
        message: "Start Your Conversation",
        chat: null,
      });
    }

    return res.status(200).json({
      message: "Chat Found",
      chat,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = {
  chatRouter,
};
