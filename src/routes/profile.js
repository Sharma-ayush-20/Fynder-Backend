const express = require("express");
const { userAuth } = require("../middlewares/auth.js");
const UserModel = require("../models/user-models.js");
const { validateEditProfile } = require("../utils/validate.js");
const upload = require("../middlewares/multer.js");
const { cloudinary } = require("../utils/Cloudinary.js");
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
profileRouter.patch(
  "/profile/edit",
  userAuth,
  upload.single("photoUrl"),
  async (req, res) => {
    try {
      //only this field should be update
      if (!validateEditProfile(req)) {
        return res
          .status(400)
          .json({ message: "You are not allowed to edit this field." });
      }
      //take user id
      const userId = req.user._id;
      //take cloudinary url
      const { firstName, lastName, about, age, gender } = req.body;
      let skills = [];
      if (req.body.skills) {
        try {
          skills = JSON.parse(req.body.skills);
        } catch {
          skills = Array.isArray(req.body.skills)
            ? req.body.skills
            : [req.body.skills];
        }
      }
      const updatedFields = {
        firstName,
        lastName,
        age,
        gender,
        skills,
        about,
      };
      if (req.file) {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "image",
        });
        updatedFields.photoUrl = uploadResult.secure_url;
      }
      //find user by user id and update the user details
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        updatedFields,
        {
          runValidators: true, //run validate in update
          new: true, //return the updated document
        }
      ).select("-password");
      //if user not updated or found
      if (!updatedUser) {
        return res.status(400).json({ message: "user not found" });
      }
      //send feedback for user update
      return res.status(200).json({
        message: `${updatedUser.firstName} your profile has been updated successfully! 🎉`,
        data: updatedUser,
      });
    } catch (error) {
      let friendlyMessage = "Something went wrong while updating your profile.";

      // Agar validation error aaye toh
      if (error.name === "ValidationError") {
        console.log(error);
        const field = Object.keys(error.errors)[0]; // jis field me error hai
        const errMsg = error.errors[field].message;

        // Custom friendly messages for each field
        switch (field) {
          case "firstName":
            friendlyMessage =
              "First name should be between 4 to 25 characters.";
            break;
          case "lastName":
            friendlyMessage = "Last name should be between 3 to 25 characters.";
            break;
          case "age":
            friendlyMessage = "Please enter a valid age between 18 and 100.";
            break;
          case "gender":
            friendlyMessage = "Gender must be male, female, or other.";
            break;
          case "about":
            friendlyMessage = "About section should not exceed 500 characters.";
            break;
          case "skills":
            friendlyMessage = "You can add up to 10 skills only.";
            break;
          case "photoUrl":
            friendlyMessage = "Please enter a valid photo URL.";
            break;
          default:
            friendlyMessage = errMsg;
        }
      }

      res.status(400).json({ message: friendlyMessage });
    }
  }
);

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

// Get Full User Profile (Public Profile)
profileRouter.get("/profile/:id", userAuth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ data: user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

profileRouter.delete("/profile/delete/:id", userAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Logged-in user ki id se compare
    if (req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! You cannot delete someone else's account.",
      });
    }

    // Delete user
    const user = await UserModel.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    // Remove auth cookie
    res.clearCookie("token");

    return res.status(200).json({
      success: true,
      message: "Your account has been deleted successfully!",
    });
  } catch (error) {
    console.log("Delete Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete account",
    });
  }
});

module.exports = { profileRouter };
