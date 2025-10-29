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
    });
    //if user not updated or found
    if (!updatedUser) {
      return res.status(400).json({ message: "user not found" });
    }
    //send feedback for user update
    return res
      .status(200)
      .json({
        message: `${updatedUser.firstName} your profile is updated successfully...`,
        data: updatedUser,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error in edit user profile: ${error.message}` });
  }
});

module.exports = { profileRouter };
