const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    timeToAcceptRequest: {
        type: Number,
        required: [true, 'Time to accept request is required'],
    },
    stopsInBetweenDestination: {
        type: Number,
        required: [true, 'Stops inbetween two destination is required'],
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