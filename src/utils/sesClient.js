// AWS SDK se SESClient import kar rahe
const { SESClient } = require("@aws-sdk/client-ses")
//set up Region for which location will be use
const Region = "ap-south-1"
// Ek SES Client bana rahe jo AWS ke SES service ko access karega
const sesClient = new SESClient({ 
    region: Region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SES_SECRET,
    }
})

module.exports = { sesClient }

