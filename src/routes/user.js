const express = require("express");
const { userAuth } = require("../middlewares/auth.js");
const {
  ConnectionRequestModel,
} = require("../models/connectionRequest-models.js");
const UserModel = require("../models/user-models.js");
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
      .populate(
        "fromUserId",
        "firstName lastName age gender about skills photoUrl"
      )
      .populate("toUserId", "firstName lastName age gender about skills");

    if (isMatchConnection.length === 0) {
      return res.status(400).json({
        message: "No Connection Matches",
      });
    }

    //check that send data of sender only
    // const data = isMatchConnection.map((data) => {
    //   if (data.fromUserId._id.toString() === LoggedInUser._id.toString()) {
    //     return data.toUserId;
    //   } else {
    //     return data.fromUserId;
    //   }
    // });
    const data = isMatchConnection
      .map((data) => {
        const from = data.fromUserId;
        const to = data.toUserId;

        if (from && from._id.toString() === LoggedInUser._id.toString()) {
          return to;
        } else {
          return from;
        }
      })
      .filter(Boolean); // remove null values

    return res.status(200).json({ message: "Your Connections", data });
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

//get the other user data for feed (Feed API)
userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    // take LoggedInUser
    const LoggedInUser = req.user;

    //add pagination for api
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    const skip = (page - 1) * limit;

    //check connection Request that not need
    const connectionRequest = await ConnectionRequestModel.find({
      $or: [{ fromUserId: LoggedInUser._id }, { toUserId: LoggedInUser._id }],
    }).select("fromUserId toUserId");

    //remove duplicate using set data structure
    const uniqueCnnectionRequest = new Set();
    connectionRequest.forEach((connectionRequest) => {
      uniqueCnnectionRequest.add(connectionRequest.fromUserId);
      uniqueCnnectionRequest.add(connectionRequest.toUserId);
    });
    // console.log(uniqueCnnectionRequest)

    //check and return all user data by excluding this uniqueConnectionRequest
    const users = await UserModel.find({
      $and: [
        { _id: { $ne: LoggedInUser._id } },
        { _id: { $nin: Array.from(uniqueCnnectionRequest) } },
      ],
    })
      .select(
        "firstName lastName age gender about skills photoUrl isPremium memberShipType premiumExpiry"
      )
      .skip(skip)
      .limit(limit);
    // console.log(users)

    //check users are there for feed
    if (!users) {
      return res.status(400).json({ message: "No User Found." });
    }

    return res.status(200).json({ message: "Your Feeds", users });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = { userRouter };
