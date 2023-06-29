const Setting = require('../models/setting');
let client;

async function getSettingData() {
    try {
        const {messagingSID, messagingAuthToken} = await Setting.findOne();
        client = require("twilio")(messagingSID, messagingAuthToken);
    } catch (error) {
        console.log(error);
    }
}
getSettingData()


async function SendMessage(SMSBody) {
    try {
        const message = await client.messages.create({body: SMSBody,from: "+13614703337",to: "+917043327239"});
    } catch (error) {
        if (error.message == "Authenticate") {
            console.log("condition check worklded");
        }
        console.log("🚀 ~ file: SMS.js:19 ~ SendMessage ~ console:", error.message);
        console.log("Error occured while sending message");
    }
}

setTimeout(() => {
    
}, 100);

module.exports = {
    SendMessage: SendMessage,
    getSettingData: getSettingData
};