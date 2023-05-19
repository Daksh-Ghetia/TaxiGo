const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    rideCustomerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'User id is required for creating ride'],
    },
    rideServiceTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Service id is required to create a ride'],
    },
    rideCityId : {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'City id is required to create a ride'],
    },
    ridePickUpLocation: {
        type: String,
        required: [true, 'Pick up location is required to create a ride'],
    },
    rideDropLocation: {
        type: String,
        required: [true, 'Drop location is required to create a ride'],
    },
    rideIntermediateStops: {
        type: Array,
    },
    rideDateTime: {
        type: Date,
        required: [true, 'Ride date and time is required'],
    },
    rideStatus: {
        type: Number,
        default: 1
    },
    rideDriverId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    rideDistance: {
        type: Number,
        required: [true, 'Ride distance is required'],
    },
    rideTime: {
        type: Number,
        required: [true, 'Ride time is required'],
    },
    rideFare: {
        type: Number,
        required: [true, 'Ride fare is required']
    },
    ridePaymentMethod: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

const Ride = new mongoose.model('Ride', rideSchema);

module.exports = Ride;

/** This is how you create instance of model and save it to db
const ride = new Ride({
    rideCustomerId: '6448d378ab88b71e1bf405b4',
    rideServiceTypeId: '6437c8403a9efe74c712069d',
    rideCityId : '6453af8b0a59be37cb3a4897',
    ridePickUpLocation: 'Rajkot bus port, rajkot, gujarat, India',
    rideDropLocation: 'Rajkot air port, rajkot, gujarat, India',
    rideIntermediateStops: ['Kotecha chowk bus stop, Kalawad Road, Nutan Nagar, Kotecha Nagar, Rajkot, Gujarat, India'],
    rideDateTime: new Date(),
    rideStatus: 0,
    rideDriverId: null,
    rideDistance: 7.3,
    rideTime: 21,
    rideFare: 86.4,
    ridePaymentMethod: 0
})

ride.save().then((result) => {
    console.log("Create Ride Added successfully", result);
}).catch((err) => {
    console.log(err);
});
*/