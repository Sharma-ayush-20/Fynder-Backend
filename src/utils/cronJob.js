const cron = require("node-cron");
const {
  ConnectionRequestModel,
} = require("../models/connectionRequest-models");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const sendEmail = require("./sendEmail");

//every 8 am this cron job will run
cron.schedule("0 8 * * *", async () => {
  //send email to all people who get requests the previous day

  const yesterday = subDays(new Date(), 1);
  const yesterdayStart = startOfDay(yesterday);
  const yesterdayEnd = endOfDay(yesterday);

  const pendingRequests = await ConnectionRequestModel.find({
    status: "interested",
    createdAt: {
      $gte: yesterdayStart,
      $lt: yesterdayEnd,
    },
  }).populate("fromUserId toUserId");
//   console.log("pending requests", pendingRequests);

  //make duplicate email to unqiue
  const listOfEmails = [
    ...new Set(
      pendingRequests.map((res) => ({
        email: res.toUserId.email,
        senderName: res.fromUserId?.firstName || "A user",
      }))
    ),
  ];
//   console.log("List of Emails", listOfEmails);

  //send email for each
  for (let data of listOfEmails) {
    const {email, senderName} = data
    try {
      const htmlbody = `
                <div style="font-family: Arial, sans-serif; background:#f7f7f7; padding:20px;">
                    <div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:8px; border:1px solid #ddd;">
                    <h2 style="color:#4A90E2;">New Friend Request 😄</h2>
                    <p>Hey there! 👋</p>
                    <p><strong>${senderName}</strong> ne tumhe friend request bheji hai 🎉</p>
                    <p>Tap the button below to view the request:</p>
                    <a 
                        href="https://fynder.site/requests" 
                        style="display:inline-block; background:#4A90E2; color:white; padding:10px 18px; border-radius:6px; text-decoration:none; font-weight:bold; margin-top:10px;">
                        View Request 🚀
                    </a>
                    <hr style="margin-top:25px;">
                    <small style="color:#777;">Email sent by: ayush@fynder.site • Do not reply.</small>
                    </div>
                </div>
                `;

      const textbody = `
            ${senderName} ne tumhe friend request bheji hai 😄

            Open your Fynder account to see who sent it:
            https://fynder.site/requests

            Email sent by: ayush@fynder.site
            (This is an automated message. Do not reply.)
                `;

      let res = await sendEmail.run(
        "sharmaayush201104@gmail.com",
        "ayush@fynder.site",
        " you have new friend request",
        htmlbody,
        textbody
      );
    //   console.log(res);
    } catch (error) {
      console.log(error);
    }
  }
});
