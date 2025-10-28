const express = require("express");
require("dotenv").config();
const bcrypt = require("bcrypt");
const { connectDB } = require("./config/database.js");
const UserModel = require("./models/user-models.js");

const app = express();
const PORT = 4000;

app.use(express.json());

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

    //encrypt the password
    const saltRound = 10;
    const hashPassword = await bcrypt.hash(password, saltRound);

    //create a user
    const user = new UserModel({
      firstName,
      lastName,
      email,
      password: hashPassword,
    });

    //save in the database
    await user.save();
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
    const isMatchPassword = await bcrypt.compare(password, user.password);

    if (!isMatchPassword) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    return res.status(200).json({ message: "User Login SuccessFully...." });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error in creating User: ${error.message}` });
  }
});

//Feed API - Get /feed - get all the users from the database
app.get("/feed", async (req, res) => {
  try {
    const allUser = await UserModel.find();
    if (!allUser) {
      res.status(400).send("No User Found");
    }
    res.send(allUser);
  } catch (error) {
    res.status(400).send("Error in gettind Users", error.message);
  }
});

app.patch("/updateuser/:userId", async (req, res) => {
  try {
    const userId = req.params?.userId;
    const updatedUserData = req.body;

    const ALLOWED_UPDATES = [
      "userId",
      "photoUrl",
      "age",
      "about",
      "skills",
      "gender",
    ]; // this thing should be update

    const isUpdateAllowed = Object.keys(updatedUserData).every((K) =>
      ALLOWED_UPDATES.includes(K)
    );
    //in my model fields are there -> K = 1 fields includes in Allowed_updated then it return true

    if (!isUpdateAllowed) {
      throw new Error("Update not allowed..");
    }
    // console.log(updatedUserData)
    const user = await UserModel.findByIdAndUpdate(userId, updatedUserData, {
      runValidators: true,
    });
    if (user) {
      res.status(200).send("User Updated SuccessFully....");
    } else {
      res.status(400).send("Problem in updating Data");
    }
  } catch (error) {
    res.status(400).send(`Error in updating user: ${error.message}`);
  }
});

app.delete("/deleteuser", async (req, res) => {
  try {
    const userId = req.body.userId;
    const deleteUser = await UserModel.findByIdAndDelete(userId);
    if (deleteUser) {
      res.status(200).send("User Deleted SuccessFully...");
    } else {
      res.status(400).send("Problem in Deleting user");
    }
  } catch (error) {
    res.status(400).send("Error in gettind Users", error.message);
  }
});

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
