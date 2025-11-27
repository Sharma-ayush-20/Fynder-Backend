const express = require("express");
const { userAuth } = require("../middlewares/auth");
const {
  ConnectionRequestModel,
} = require("../models/connectionRequest-models");
const UserModel = require("../models/user-models");
const requestRouter = express.Router();
const sendEmail = require("../utils/sendEmail");

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

      //Email content
      const actionText =
        status === "interested"
          ? "is interested in connecting with you on Fynder! ❤️"
          : "has ignored your connection request.";

      const subject = `${fromUserIdDetails.firstName} ${actionText}`;

      const htmlBody = `
      <h3>Hello ${toUserIdDetails.firstName}, 👋</h3>
      <p><strong>${fromUserIdDetails.firstName}</strong> ${actionText}</p>

      ${
        status === "interested"
          ? `<p>You can view their profile and connect back!</p>
         <a href="https://fynder.site/profile/${fromUserIdDetails._id}"
         style="background:black;color:white;padding:10px 18px;border-radius:6px;text-decoration:none;">
         View Profile</a>`
          : `<p>No worries! You can continue exploring and find new matches.</p>`
      }

        <p style="font-size:12px;color:#666;margin-top:20px;">
        This is an automated email from Fynder.
        </p>`;

      const textBody = `
          Hello ${toUserIdDetails.firstName},
          ${fromUserIdDetails.firstName} ${actionText}
          Visit Fynder: https://fynder.site
          `;

      // Send Email
      const emailRes = await sendEmail.run(
        "sharmaayush201104@gmail.com", // Receiver
        "ayush@fynder.site", // Verified Sender
        subject,
        htmlBody,
        textBody
      );

      console.log("Email Response: ", emailRes);

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

//create api for accepted and rejected connection Request
requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const { status, requestId } = req.params;
      const loggedInUserId = req.user._id;

      // Validate status
      const ALLOWED_STATUS = ["accepted", "rejected"];
      if (!ALLOWED_STATUS.includes(status)) {
        return res.status(400).json({ message: "Invalid status type" });
      }
      //check request id is valid or not
      const connection = await ConnectionRequestModel.findById(requestId);
      if (!connection) {
        return res.status(400).json({ message: "Invalid request ID..." });
      }

      //find connectionRequest in connectionModel with using _id, toUserId, status
      const yourConnectionRequest = await ConnectionRequestModel.findOne({
        _id: requestId,
        toUserId: loggedInUserId,
        status: "interested",
      });
      // console.log(yourConnectionRequest)

      if (!yourConnectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection request does not exist.." });
      }

      yourConnectionRequest.status = status;
      await yourConnectionRequest.save();

      // Get sender info
      const fromUserData = await UserModel.findById(
        yourConnectionRequest.fromUserId
      );

      // Return success response
      return res.status(200).json({
        message: `${req.user.firstName} ${status} ${fromUserData.firstName}'s request.`,
        data: yourConnectionRequest,
      });
    } catch (error) {
      console.error("Error in /request/review route:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
);

module.exports = { requestRouter };
