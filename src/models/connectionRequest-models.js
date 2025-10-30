const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      },
    },
  },
  {
    timestamps: true,
  }
);

//provide compound index for optimization for search query operation
connectionRequestSchema.index({fromUserId: 1, toUserId: 1})

//check that fromUserId is same as toUserId
connectionRequestSchema.pre("save", async function (next) {
  const connection = this;
  if(connection.fromUserId.equals(connection.toUserId)){
    throw new Error("Cannot send connection request to yourself...")
  }
  next();
})

const ConnectionRequestModel = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);
module.exports = { ConnectionRequestModel };
