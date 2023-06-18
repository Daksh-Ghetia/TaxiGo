const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    timeToAcceptRequest: {
        type: Number,
        required: [true, 'Time to accept request is required'],
    },
    stopsInBetweenDestination: {
        type: Number,
        required: [true, 'Stops inbetween two destination is required'],
    },
    stripePublicKey: {
        type: String,
        required: [true, "Stripe public key is required"],
    },
    stripeSecretKey: {
        type: String,
        required: [true, "Stripe secret key is required"],
    },
    messagingSID: {
        type: String,
        required: [true, "SID is required for messaging"]
    },
    messagingAuthToken: {
        type: String,
        required: [true, "Authentication token is required for messaging"]
    },
    mailClientID: {
        type: String,
        required: [true, "Client ID is required for mail"]
    },
    mailClientSecret: {
        type: String,
        required: [true, "Client secret is required for mail"]
    }
}, {
    timestamps: true
})

const Setting = new mongoose.model('Setting', settingSchema);

module.exports = Setting;

/* Add user check
const setting = new Setting({
    timeToAcceptRequest: 30,
    stopsInBetweenDestination: 2
})

setting.save().then((result) => {
    console.log('Setting inserted successfully');
}).catch((error) => {
    console.log(error);
});
*/