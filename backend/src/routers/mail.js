const Setting = require('../models/setting');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
let oAuth2Client,CLIENT_ID,CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04FRfn4bI2VnUCgYIARAAGAQSNgF-L9Ir203Y4DxqKR-InuuXI6xOM1q-s1-76t4cKl14Z2JiIc_7sZsjI_KTf1TqIDKWKJiRig';

async function getSettingData() {
    try {
        let setting = await Setting.findOne();
        CLIENT_ID = setting.mailClientID;
        CLIENT_SECRET = setting.mailClientSecret;
        
        oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
        oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN})
    } catch (error) {
        console.log(error.message);
    }
}
getSettingData();
// const CLIENT_ID = '552509408536-g966403bdh7v11t99knt6h1jahen263f.apps.googleusercontent.com';
// const CLIENT_SECRET = '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';


async function sendMail(mailRecipient, mailSubject, mailBodyText = "", mailBodyHTML="") {
    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'oauth2',
                user: 'dk.elluminati@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken
            }
        })

        const mailOptions = {
            from: 'Daksh Ghetia <dk.elluminati@gmail.com>',
            to: mailRecipient,
            subject: mailSubject,
            text: mailBodyText,
            html: mailBodyHTML
        };

        const result = await transport.sendMail(mailOptions);
        return result
    } catch (error) {
        if (error.message == "invalid_client") {
            throw new Error("Invalid credentials for mailing system");
        } else {
            throw new Error(error.message)
        }
    }
}

module.exports = {
    getSettingData: getSettingData,
    sendMail: sendMail
}