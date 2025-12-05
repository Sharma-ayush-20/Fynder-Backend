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
      const userId = req.user._id;

      // OLD values fetch karo (agar kuch missing aaye frontend se to)
      const existingUser = await UserModel.findById(userId);

      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedFields = {
        firstName: req.body.firstName || existingUser.firstName,
        lastName: req.body.lastName || existingUser.lastName,
        about: req.body.about || existingUser.about,
        age: req.body.age || existingUser.age,
        gender: req.body.gender || existingUser.gender,
      };

      // 🧠 Skills → always Array convert
      if (req.body.skills) {
        try {
          updatedFields.skills = JSON.parse(req.body.skills);
        } catch {
          updatedFields.skills = Array.isArray(req.body.skills)
            ? req.body.skills
            : [req.body.skills];
        }
      } else {
        updatedFields.skills = existingUser.skills;
      }

      // 📸 Only when updated file present
      if (req.file) {
        const uploadResult = await cloudinary.uploader.upload(req.file.path);
        updatedFields.photoUrl = uploadResult.secure_url;
      } else {
        updatedFields.photoUrl = existingUser.photoUrl;
      }

      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        updatedFields,
        { new: true, runValidators: true }
      ).select("-password");

      return res.status(200).json({
        message: `${updatedUser.firstName}, your profile updated successfully! 🎉`,
        data: updatedUser,
      });

    } catch (error) {
      console.log("UPDATE ERROR:", error);
      return res.status(400).json({
        message: error.message || "Something went wrong while updating profile.",
      });
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
