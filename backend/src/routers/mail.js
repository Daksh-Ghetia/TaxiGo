const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const CLIENT_ID = '552509408536-g966403bdh7v11t99knt6h1jahen263f.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04FRfn4bI2VnUCgYIARAAGAQSNgF-L9Ir203Y4DxqKR-InuuXI6xOM1q-s1-76t4cKl14Z2JiIc_7sZsjI_KTf1TqIDKWKJiRig';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN})

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
        console.log("error occure while sending mail");
        return error;
    }
}

module.exports = {
    sendMail: sendMail
}