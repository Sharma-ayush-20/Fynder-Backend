const express = require("express");
const UserModel = require("../models/user-models");
const authRouter = express.Router();

//Signup Route
authRouter.post("/signup", async (req, res) => {
  try {
    const userData = req.body;
    const { firstName, lastName, email, password } = userData;
    const ALLOWED_SIGNUP = ["firstName", "lastName", "email", "password"];
    const isSignupAllow = Object.keys(userData).every((data) =>
      ALLOWED_SIGNUP.includes(data)
    );
    //check only this field should be filled
    if (!isSignupAllow) {
      return res.status(400).json({
        message:
          "You can only provide first name, last name, email, and password.",
      });
    }
    //check field is empty
    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields." });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "This email is already registered. Please log in." });
    }

    //create a user
    const user = new UserModel({
      firstName,
      lastName,
      email,
      password,
    });

    //save in the database
    await user.save();

    //create a token
    const token = await user.getJWT();
    //send in a cookie
    res.cookie("token", token);
    return res.status(200).json({
      message: `Welcome aboard, ${user.firstName}! 🎉 Your account has been created successfully.`,
      user,
    });
  } catch (error) {
    let friendlyMessage =
      "Something went wrong while signing up. Please try again.";
    // Handle validation errors from Mongoose
    if (error.name === "ValidationError") {
      const field = Object.keys(error.errors)[0];
      const errMsg = error.errors[field].message;

      switch (field) {
        case "firstName":
          friendlyMessage = "First name should be between 4 to 25 characters.";
          break;
        case "lastName":
          friendlyMessage = "Last name should be between 3 to 25 characters.";
          break;
        case "email":
          friendlyMessage = "Please enter a valid email address.";
          break;
        case "password":
          friendlyMessage =
            "Password must be strong — include uppercase, number, and a special character.";
          break;
        default:
          friendlyMessage = errMsg;
      }
    }

    // Send final message
    res.status(400).json({ message: friendlyMessage });
  }
});

//login route
authRouter.post("/login", async (req, res) => {
  try {
    const userData = req.body;
    const { email, password } = userData;
    const ALLOWED_LOGIN = ["email", "password"];
    const isLoginAllow = Object.keys(userData).every((K) =>
      ALLOWED_LOGIN.includes(K)
    );
    //check only this field should be filled
    if (!isLoginAllow) {
      return res.status(400).json({ message: "Login not allowed.." });
    }
    if (!email) {
      return res.status(400).json({ message: "Please provide email" });
    }
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    if (!password) {
      return res.status(400).json({ message: "Please provide password" });
    }

    //compare password
    const isMatchPassword = await user.verifyPassword(password);

    if (!isMatchPassword) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    //create a token
    const token = await user.getJWT();
    //send in a cookie
    res.cookie("token", token);

    return res
      .status(200)
      .json({
        message: `Login successful! 🚀 Welcome back, ${user.firstName}.`,
        user,
      });
  } catch (error) {
    let friendlyMessage = "Something went wrong while login. Please try again.";
    // Handle validation errors from Mongoose
    if (error.name === "ValidationError") {
      const field = Object.keys(error.errors)[0];
      const errMsg = error.errors[field].message;

      switch (field) {
        case "email":
          friendlyMessage = "Please enter a valid email address.";
          break;
        case "password":
          friendlyMessage =
            "Password must be strong — include uppercase, number, and a special character.";
          break;
        default:
          friendlyMessage = errMsg;
      }
    }

    // Send final message
    res.status(400).json({ message: friendlyMessage });
  }
});

//logout route
authRouter.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "User logged out successfully..." });
  } catch (error) {
    res.status(500).json({ message: `Error in logout User: ${error.message}` });
  }
});

module.exports = { authRouter };
