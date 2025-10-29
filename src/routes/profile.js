const express = require("express");
const { userAuth } = require("../middlewares/auth.js");
const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    //take current user data
    const user = req.user;
    //send a response
    res.status(200).json({ user: user });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error in get user profile: ${error.message}` });
  }
});

module.exports = { profileRouter };
