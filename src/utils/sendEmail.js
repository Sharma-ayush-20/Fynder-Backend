const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("./sesClient.js");

const createSendEmailCommand = (toAddress, fromAddress, subject, htmlBody, textBody) => {
  return new SendEmailCommand({
    Destination: {
      ToAddresses: [
        toAddress,
      ],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: htmlBody,
        },
        Text: {
          Charset: "UTF-8",
          Data: textBody,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: fromAddress,
    ReplyToAddresses: [
    ],
  });
};

const run = async (toAddress, fromAddress, subject, htmlBody, textBody) => {
  const sendEmailCommand = createSendEmailCommand(
    // "sharmaayush201104@gmail.com",
    // "ayush@fynder.com", //sender
    toAddress, fromAddress, subject, htmlBody, textBody,
  );

  try {
    return await sesClient.send(sendEmailCommand);
  } catch (caught) {
    if (caught instanceof Error && caught.name === "MessageRejected") {
      const messageRejectedError = caught;
      return messageRejectedError;
    }  
    throw caught;
  }
};

module.exports = { run };
