const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    countryId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    cityName: {
        type: String,
        required: true,
        unique: [true, "City Name cannot be duplicate"],
        trim: true
    },
    cityLatLng: {
        type: Array,
        required: true,
        trim: true,
    }
}, {
    timestamps: true
})

const City = new mongoose.model('City', citySchema)

module.exports = City

/** This is how you create instance of a model and save it to db
const addCity = new City({
    countryId: "64467bc538336e32ab8ba204",
    cityName: "Rajkot",
    cityLatLng: [
        {
            "lat": 21.77700455509636,
            "lng": 70.48151616687906
        },
        {
            "lat": 22.69223827978358,
            "lng": 70.35517339344156
        },
        {
            "lat": 22.97069057685756,
            "lng": 72.21735601062906
        },
        {
            "lat": 21.93505264667201,
            "lng": 72.21735601062906
        }
    ]
})

addCity.save().then((result) => {
    console.log("City Added successfully", result);
}).catch((err) => {
    console.log(err);
});
*/