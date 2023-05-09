const mongoose = require('mongoose');

const vehiclePricingSchema = new mongoose.Schema({
    countryId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Country id is required'],
    },
    cityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'City id is required'],
    },
    vehicleTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Vehicle type id is required'],
    },
    driverProfit: {
        type: Number,
        required: [true, 'Driver profit is required'],
        trim: true,
    },
    minimumFare: {
        type: Number,
        required: [true, 'Minimum fare is required'],
        trim: true,
    },
    distanceForBasePrice: {
        type: Number,
        required: [true, 'Distance for base price is required'],
        trim: true,
    },
    basePrice: {
        type: Number,
        required: [true, 'Base price is required'],
        trim: true,
    },
    pricePerUnitDistance: {
        type: Number,
        required: [true, 'Price per unit distance is required'],
        trim: true,
    },
    pricePerUnitTime: {
        type: Number,
        required: [true, 'Price per unit time is required'],
        trim: true,
    },
    maxSpace: {
        type: Number,
        required: [true, 'Max space is required'],
        trim: true,
    }
}, {
    timestamps: true
})

const VehiclePricing = new mongoose.model('Vehicle Pricing', vehiclePricingSchema);

module.exports = VehiclePricing;

/* This is how you create instance of a model and save it to db
const addVehiclePricing = new VehiclePricing({
    countryId: "6453a2a139a89665222b020c",
    cityId: "6453af8b0a59be37cb3a4897",
    vehicleTypeId: "64539d9d856aa43f4047479e",
    driverProfit: 80,
    minimumFare: 20,
    distanceForBasePrice: 1,
    basePrice: 20,
    pricePerUnitDistance: 10,
    pricePerUnitTime: 1,
    maxSpace: 3
})

addVehiclePricing.save().then((result) => {
    console.log('Vehicle Type added successfully' + result);
}).catch((error) => {
    console.log('Error occured while adding vehicle type!!' +  error);
});
*/