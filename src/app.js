const express = require("express");
require("dotenv").config();
const { connectDB } = require("./config/database.js");
const UserModel = require("./models/user-models.js");

const app = express();
const PORT = 4000;

app.use(express.json());

app.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const user = new UserModel({
    firstName,
    lastName,
    email,
    password,
  });

  try {
    await user.save();
    res.send("User Created SuccessFully....");
  } catch (error) {
    res.status(400).send("Error in creating User", error.message);
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
