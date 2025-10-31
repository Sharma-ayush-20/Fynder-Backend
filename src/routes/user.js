const express = require("express");
const { userAuth } = require("../middlewares/auth.js");
const {
  ConnectionRequestModel,
} = require("../models/connectionRequest-models.js");
const userRouter = express();

//get the connections of user (accepted)
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    //take your login user
    const LoggedInUser = req.user;

    const isMatchConnection = await ConnectionRequestModel.find({
      status: "accepted",
      $or: [{ toUserId: LoggedInUser._id }, { fromUserId: LoggedInUser._id }],
    })
      .populate("fromUserId", "firstName lastName age gender about skills")
      .populate("toUserId", "firstName lastName age gender about skills");

    if (isMatchConnection.length === 0) {
      return res.status(400).json({
        message: "No Connection Matches",
      });
    }

    //check that send data of sender only
    const data = isMatchConnection.map((data) => {
        if(data.fromUserId._id.toString() === LoggedInUser._id.toString()){
            return data.toUserId
        }else{
            return data.fromUserId
        }
    })

    return res
      .status(200)
      .json({ message: "Your Connections", data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//get the user requests (interested)
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const LoggedInUser = req.user;

    //check which user status is interested
    const isRequestUser = await ConnectionRequestModel.find({
      $and: [{ toUserId: LoggedInUser._id }, { status: "interested" }],
    }).populate(
      "fromUserId",
      "firstName lastName age gender about photoUrl skills"
    );

    if (isRequestUser.length === 0) {
      return res.status(400).json({ message: "No Request Found." });
    }

    return res
      .status(200)
      .json({ message: "Your Requests", data: isRequestUser });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = { userRouter };
