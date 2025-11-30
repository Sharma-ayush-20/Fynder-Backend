const express = require("express");
const { userAuth } = require("../middlewares/auth");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay.js");
const { PaymentModel } = require("../models/payment-models.js");
const memberShipAmount = require("../utils/constants.js");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const UserModel = require("../models/user-models.js");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    //req.body data membership type and period
    const { memberShipType, memberShipPeriod } = req.body;
    //loggedIn user details
    const { firstName, lastName, email } = req.user;
    //amount calculate
    const amount = memberShipAmount?.[memberShipType]?.[memberShipPeriod];

    const order = await razorpayInstance.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName: firstName,
        lastName: lastName,
        memberShipType: memberShipType,
        memberShipPeriod: memberShipPeriod,
      },
    });
    // console.log(order)

    //save all the order information in payment model
    const payment = new PaymentModel({
      userId: req.user._id,
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
      notes: order.notes,
      status: order.status,
      receipt: order.receipt,
    });

    const savedPayment = await payment.save();

    return res.status(200).json({
      ...savedPayment.toJSON(),
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error in creating order -> " + error.message,
    });
  }
});

//after order created -> razorpay will automatically call this API
paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    console.log("🔥 Webhook HIT!", req.body);

    //take webhook signature
    const webhookSignature = req.get("X-Razorpay-Signature");

    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    //check that webhook is valid or not
    if (!isWebhookValid) {
      return res.status(400).json({
        message: "Invalid webhook signature",
      });
    }

    //if the webhook is successfull then update the payment status in DB and update the user as a premium user
    //then return success response
    const paymentDetails = req.body.payload.payment.entity;

    const payment = await PaymentModel.findOne({
      orderId: paymentDetails.order_id,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found in DB" });
    }

    payment.status = paymentDetails.status;
    await payment.save();
    console.log("💾 Payment updated in DB");

    const user = await UserModel.findOne({ _id: payment.userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Upgrade user to premium
    user.isPremium = true;
    user.memberShipType = paymentDetails.notes.memberShipType;
    user.memberShipPeriod = paymentDetails.notes.memberShipPeriod;

    // Set expiry based on plan
    if (user.memberShipPeriod === "monthly") {
      user.premiumExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else if (user.memberShipPeriod === "yearly") {
      user.premiumExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }

    await user.save();
    console.log("🎉 User upgraded to premium");

    return res
      .status(200)
      .json({ message: "Webhook verified & premium updated!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error in webhook -> " + error.message,
    });
  }
});

module.exports = { paymentRouter };
