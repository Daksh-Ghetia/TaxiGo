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


async function sendMail(mailRecipient, mailSubject, mailBodyText, mailBodyHTML) {
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
            html: mailBodyHTML,
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


// async function sendMailDemo() {
//     try {
//         setTimeout(() => {
//             ride = {
//                 _id: "6464971690c2a508542b79c1",
//                 rideCustomerId: "6454f32fdf0aff072164859d",
//                 user: {
//                     userName: "jay kanani",
//                     userPhone: "1111111111",
//                     userEmail: "jay@gmail.com"
//                 },
//                 vehicleType: {
//                     vehicleName: "hatchback"
//                 },
//                 driver: [
//                     {
//                         driverName: "shubham shah"
//                     }
//                 ],
//                 ridePickUpLocation: "RAJKOT BUS PORT, Kanak Road, Karanpara, Rajkot, Gujarat, India",
//                 rideDropLocation: "Rajkot Airport, Airport Main Road, Amarjeet Nagar, Rajkot, Gujarat, India",
//                 rideDateTime: new Date(),
//                 rideDistance: 4,
//                 rideTime: 11,
//                 rideFare: 50
//             }

//             sendMail("xikodi9677@fitwl.com", "Demo mail", "", `
//             Congratulations <h5>Daksh</h5>, your ride has been completed successfully. 
//             <br>
//             <H2>Ride summary</H2>

//             <table>
//                 <tbody>
//                     <tr>
//                         <td class="label-input">Ride id: </td>
//                         <td>${ride._id}</td>
//                     </tr>
//                     <tr>
//                         <td class="label-input">User id: </td>
//                         <td>${ride.rideCustomerId}</td>
//                     </tr>
//                     <tr>
//                         <td class="label-input">User name: </td>
//                         <td>${ride.user.userName}</td>
//                     </tr>
//                     <tr>
//                         <td class="label-input">User contact no: </td>
//                         <td>${ride.user.userPhone}</td>
//                     </tr>
//                     <tr>
//                         <td class="label-input">User email: </td>
//                         <td>${ride.user.userEmail} </td>
//                     </tr>
//                     <tr>
//                         <td class="label-input">Vehicle type: </td>
//                         <td>${ride.vehicleType.vehicleName} </td>
//                     </tr>
//                     <tr>
//                         <td class="label-input">Driver Name: </td>
//                         <td>${ride.driver[0].driverName} </td>
//                     </tr>
//                     <tr>
//                         <td class="label-input">Pick point: </td>
//                         <td><li>${ride.ridePickUpLocation}</li> </td>
//                     </tr>
//                     <tr>
//                         <td class="label-input">Drop point: </td>
//                         <td><li>${ride.rideDropLocation}</li> </td>
//                     </tr>
//                     <tr>
//                         <td class="label-input">Ride Date and Time: </td>
//                         <td>${ride.rideDateTime}</td>
//                     </tr>
//                     <tr>
//                         <td class="label-input">Ride Distance: </td>
//                         <td>${ride.rideDistance} </td>
//                     </tr>
//                     <tr>
//                         <td class="label-input">Total travel time: </td>
//                         <td>${ride.rideTime} </td>
//                     </tr>
//                     <tr>
//                         <td class="label-input">Estimated Fare: </td>
//                         <td>${ride.rideFare} </td>
//                     </tr>
//                     <tr>
//                         <td class="label-input">Payment method: </td>
//                         <td></td>
//                     </tr>            
//                 </tbody>
//             </table>
//             `)
//         }, 1000);
//     } catch (error) {
//         console.log("errorrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", error);
//     }
// }

// async function call() {
//     try {
//         await sendMailDemo();
//     } catch (error) {
//         console.log(error);
//     }
// }

// call();

module.exports = {
    getSettingData: getSettingData,
    sendMail: sendMail
}