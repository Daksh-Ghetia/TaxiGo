const accountSid = "ACee4aff8103262da2f169b1155f93b9f6";
const authToken = "bc73fb368adf7927c02e0ae455be6305";
const client = require("twilio")(accountSid, authToken);

async function SendMessage(SMSBody) {
    try {
        const message = await client.messages.create({body: SMSBody,from: "+13614703337",to: "+917043327239"});
        console.log(message.sid);
    } catch (error) {
        console.log("Error occured while sending message");
    }
}

module.exports = {
    SendMessage: SendMessage
};