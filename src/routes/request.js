const express = require("express");
const { userAuth } = require("../middlewares/auth");
const {
  ConnectionRequestModel,
} = require("../models/connectionRequest-models");
const UserModel = require("../models/user-models");
const requestRouter = express.Router();

//create api for interested and ignore connection Request
requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      //take from, to id and status
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      //check field is not empty
      if (!fromUserId || !toUserId) {
        return res.status(400).json({ message: "from and to Id not Found" });
      }

      //only Ignored and Interested field are allow
      const ALLOW_STATUS = ["ignored", "interested"];
      const isAllowStatus = ALLOW_STATUS.includes(status);
      if (!isAllowStatus) {
        return res
          .status(400)
          .json({ message: "This Status is not Allowed..." });
      }

      //check toUserId is present in database
      const toUserIdDetails = await UserModel.findById(toUserId);
      if (!toUserIdDetails) {
        return res.status(400).json({ message: "user not found" });
      }

      //only one time this request made
      const existingConnectionRequest = await ConnectionRequestModel.findOne({
        $or: [
          { fromUserId, toUserId }, //A->B again
          { fromUserId: toUserId, toUserId: fromUserId }, //B->A
        ],
      });
      if (existingConnectionRequest) {
        return res
          .status(400)
          .json({ message: "Connection Request is already made..." });
      }
      //get fromUserId details
      const fromUserIdDetails = await UserModel.findById(fromUserId);

      //create a instance
      const connectionRequest = new ConnectionRequestModel({
        fromUserId,
        toUserId,
        status,
      });
      const data = await connectionRequest.save();

      return res.status(200).json({
        message: `${fromUserIdDetails?.firstName} ${
          status === "interested" ? "interested" : "ignored"
        } ${toUserIdDetails?.firstName} `,
        data,
      });
    } catch (error) {
      console.error("Error in requestRouter", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
);

module.exports = { requestRouter };
