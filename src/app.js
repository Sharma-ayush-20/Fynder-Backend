const express = require("express");
require("dotenv").config();
const { connectDB } = require("./config/database.js");
const UserModel = require("./models/user-models.js");

const app = express();
const PORT = 4000;

app.use(express.json());

app.post("/signup", async (req, res) => {
  const userData = req.body;
  const user = new UserModel(userData);

  try {
    await user.save();
    res.send("User Created SuccessFully....");
  } catch (error) {
    res.status(400).send(`Error in creating User: ${error.message}`);
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

    const ALLOWED_UPDATES = ["userId", "photoUrl", "age", "about", "skills", "gender"] // this thing should be update

    const isUpdateAllowed = Object.keys(updatedUserData).every((K) => ALLOWED_UPDATES.includes(K))
    //in my model fields are there -> K = 1 fields includes in Allowed_updated then it return true

    if(!isUpdateAllowed){
      throw new Error("Update not allowed..")
    }
    // console.log(updatedUserData)
    const user = await UserModel.findByIdAndUpdate(userId, updatedUserData, {runValidators: true})
    if(user){
      res.status(200).send("User Updated SuccessFully....")
    }else{
      res.status(400).send("Problem in updating Data")
    }
  }  catch (error) {
    res.status(400).send(`Error in updating user: ${error.message}`);
  }
});

app.delete("/deleteuser", async (req, res) => {
  try {
    const userId = req.body.userId;
    const deleteUser = await UserModel.findByIdAndDelete(userId)
    if(deleteUser){
      res.status(200).send("User Deleted SuccessFully...")
    }
    else{
      res.status(400).send("Problem in Deleting user")
    }
  } catch (error) {
    res.status(400).send("Error in gettind Users", error.message);
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
