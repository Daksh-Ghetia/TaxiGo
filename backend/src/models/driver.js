const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    driverName: {
        type: String,
        required: [true, 'Driver name is required'],
        lowercase: true,
        trim: true
    },
    driverEmail: {
        type: String,
        required: [true, 'Driver email id is required'],
        trim: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: function(value) {
              return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
            },
            message: () => `Please enter a valid email!`
          }
    },
    driverPhone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        validate: {
            validator: function(value) {
              return /^(\+?\d{1,3}[- ]?)?\d{10}$/.test(value);
            },
            message: () => `Please enter a valid phone number!`
        }
    },
    driverCountryId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Driver country is required'],
        trim: true
    },
    driverCityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Driver city is required'],
        trim: true
    },
    driverServiceTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    // driverPricingId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     default: null
    // },
    driverStatus: {
        type: Boolean,
        default: false,
        required: true
    },
    driverProfile: {
        type: String
    }
}, {
    timestamps: true
})

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;

