const express = require("express");
const { userAuth } = require("../middlewares/auth.js");
const profileRouter = express.Router();

profileRouter.get("/profile", userAuth, async (req,res) => {
  try {
    const user = req.user;
    res.send(user)
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error in profile route: ${error.message}` });
  }
})

module.exports = {profileRouter}