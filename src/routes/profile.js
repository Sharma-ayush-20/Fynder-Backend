const express = require("express");
const { userAuth } = require("../middlewares/auth.js");
const UserModel = require("../models/user-models.js");
const { validateEditProfile } = require("../utils/validate.js");
const profileRouter = express.Router();

//get a user profile
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

//edit user profile
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    //only this field should be update
    if (!validateEditProfile(req)) {
      return res.status(400).json({ message: "Edit not allowed..." });
    }
    //take user id
    const userId = req.user._id;
    //find user by user id and update the user details
    const updatedUser = await UserModel.findByIdAndUpdate(userId, req.body, {
      runValidators: true, //run validate in update
      new: true, //return the updated document
    }).select("-password");
    //if user not updated or found
    if (!updatedUser) {
      return res.status(400).json({ message: "user not found" });
    }
    //send feedback for user update
    return res.status(200).json({
      message: `${updatedUser.firstName} your profile is updated successfully...`,
      data: updatedUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error in edit user profile: ${error.message}` });
  }
});

//change the password specifically
profileRouter.post("/profile/password", userAuth, async (req, res) => {
  try {
    // take user data
    const user = req.user;
    //take user old password and new password
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Please provide old and new password" });
    }

    const isMatchPassword = user.verifyPassword(oldPassword);
    //check old password is match or not
    if (!isMatchPassword) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    //hash and update the new password
    user.password = newPassword;
    await user.save();

    //feeback
    return res
      .status(200)
      .json({ message: "Your password changed successfully..." });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error in edit user password: ${error.message}` });
  }
});

module.exports = { profileRouter };
