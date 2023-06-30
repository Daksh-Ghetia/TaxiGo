const Setting = require('../models/setting');
let client;

async function getSettingData() {
    const {messagingSID, messagingAuthToken} = await Setting.findOne();
    client = require("twilio")(messagingSID, messagingAuthToken);
}
getSettingData()

async function SendMessage(SMSBody) {
    try {
        const message = await client.messages.create({body: SMSBody,from: "+13614703337",to: "+917043327239"});
    } catch (error) {
        if (error.message == "Authenticate") {
            throw new Error("authentication error please check account SID and authentication token" || error.message);
        }
        else throw new Error(error.message);
    }
}

module.exports = {
    SendMessage: SendMessage,
    getSettingData: getSettingData
};