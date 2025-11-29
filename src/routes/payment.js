const express = require("express");
const { userAuth } = require("../middlewares/auth");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay.js");
const { PaymentModel } = require("../models/payment-models.js");
const memberShipAmount = require("../utils/constants.js");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
    try {

        //req.body data membership type and period
        const { memberShipType, memberShipPeriod } = req.body;
        //loggedIn user details
        const { firstName, lastName, email } = req.user
        //amount calculate
        const amount =  memberShipAmount?.[memberShipType]?.[memberShipPeriod];

        const order = await razorpayInstance.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: "receipt#1",
            notes: {
                firstName: firstName,
                lastName: lastName,
                memberShipType: memberShipType,
                memberShipPeriod: memberShipPeriod
            }
        })
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
        })

        const savedPayment =  await payment.save()  

        return res.status(200).json({
            ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID
        })
    } catch (error) {
        
    }
})

module.exports = {paymentRouter}