const express = require("express");
require("dotenv").config();
const bcrypt = require("bcrypt");
const { connectDB } = require("./config/database.js");
const UserModel = require("./models/user-models.js");
const cookieParser = require("cookie-parser");
const { userAuth } = require("./middlewares/auth.js");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(cookieParser());

//signup route
app.post("/signup", async (req, res) => {
  try {
    const userData = req.body;
    const { firstName, lastName, email, password } = userData;
    const ALLOWED_SIGNUP = ["firstName", "lastName", "email", "password"];
    const isSignupAllow = Object.keys(userData).every((data) =>
      ALLOWED_SIGNUP.includes(data)
    );
    //check only this field should be filled
    if (!isSignupAllow) {
      return res.status(400).json({ message: "Signup not allowed.." });
    }
    //check field is empty
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "please Fill all the details" });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
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
    return res.status(200).json({ message: "User Signup SuccessFully...." });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error in creating User: ${error.message}` });
  }
});

//login route
app.post("/login", async (req, res) => {
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
    const isMatchPassword = await user.verifyPassword(password)

    if (!isMatchPassword) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    //create a token
    const token = await user.getJWT();
    //send in a cookie
    res.cookie("token", token);

    return res.status(200).json({ message: "User Login SuccessFully...." });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error in creating User: ${error.message}` });
  }
});

app.get("/profile", userAuth, async (req,res) => {
  try {
    const user = req.user;
    res.send(user)
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error in profile route: ${error.message}` });
  }
})

connectDB()
  .then(() => {
    console.log(`Database Connected SuccessFully....`);
    app.listen(PORT, () => {
      console.log(`Server is Listening at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log(`Problem in database Connection`, error.message);
  });
