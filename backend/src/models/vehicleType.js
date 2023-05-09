const mongoose = require('mongoose');

const vehicleTypeSchema = new mongoose.Schema({
    vehicleName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    vehicleIcon: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
})

const vehicleType = new mongoose.model('vehicleType', vehicleTypeSchema);

module.exports = vehicleType

/* This is how you create instance of a model and save it to db
const addvehicle = new vehicle({
    vehicleName: 'W11',
    vehicleIcon: 'beast disguised as beauty'
})

addvehicle.save().then((result) => {
    console.log('vehicle Type added successfully' + result);
}).catch((error) => {
    console.log('Error occured while adding vehicle type!!' +  error);
});
*/