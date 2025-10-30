//create api for accepted and rejected connection Request
// requestRouter.post(
//   "/request/review/:status/:requestId",
//   userAuth,
//   async (req, res) => {
//     try {
//       const { status, requestId } = req.params;
//       const loggedInUserId = req.user._id.toString();
//       // console.log(loggedInUserId);

//       // Validate status
//       const ALLOWED_STATUS = ["accepted", "rejected"];
//       if (!ALLOWED_STATUS.includes(status)) {
//         return res.status(400).json({ message: "Invalid status type" });
//       }

//       const connectionRequest = await ConnectionRequestModel.findById(
//         requestId
//       );
//       // console.log("hamra console", connectionRequest)
//       if (!connectionRequest) {
//         return res
//           .status(404)
//           .json({ message: "No connection request found" });
//       }
//       // console.log("error ",  connectionRequest.toUserId.toString() === loggedInUserId)
//       // console.log("error ",  connectionRequest.toUserId.toString())
//       //  console.log("error ", loggedInUserId)
//       if (
//         connectionRequest.toUserId.toString() === loggedInUserId &&
//         connectionRequest.status === "interested"
//       ) {
//         // Debug logs
//         // console.log("Request ID:", requestId);
//         // console.log("LoggedIn User ID:", loggedInUserId);
//         // console.log("Found Request:", connectionRequest);

//         // Update status (accepted / rejected)
//         connectionRequest.status = status;
//         await connectionRequest.save();

//         // Get sender info
//         const fromUser = await UserModel.findById(connectionRequest.fromUserId);

//         // Return success response
//         return res.status(200).json({
//           message: `${req.user.firstName} ${status} ${fromUser.firstName}'s request.`,
//           data: connectionRequest,
//         });
//       } else {
//         return res
//           .status(404)
//           .json({ message: "No pending connection request found" });
//       }
//     } catch (error) {
//       console.error("Error in /request/review route:", error.message);
//       return res.status(500).json({ message: error.message });
//     }
//   }
// );