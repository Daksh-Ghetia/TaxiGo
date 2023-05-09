const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
    countryName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    countryTimeZone: {
        type: String,
        required: true,
        trim: true
    },
    countryCode: {
        type: String,
        required: true,
        trim: true
    },
    countryCurrency: {
        type: String,
        required: true,
        trim: true
    },
    countryCurrencySymbol: {
        type: String,
        required: true,
        trim: true
    },
    countryFlag: {
        type: String,
        required: true,
        trim: true
    },
    countryIcon: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const Country = new mongoose.model('Country', countrySchema);

module.exports = Country;

/** This is how you create instance of a model and save it to db
const addCountry = new Country({
    countryName: 'India',
    countryTimeZone: 'UTC +5:30',
    countryCode: '+91',
    countryCurrency: 'Indian Rupees',
    countryCurrencySymbol: '₹',
    countryFlag: '🇮🇳'
})

addCountry.save().then((result) => {
    console.log('Country added successfully' + result);
}).catch((error) => {
    console.log('Error occured while adding country!!' +  error);
});
*/