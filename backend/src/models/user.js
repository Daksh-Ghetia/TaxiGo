const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, 'User name is required'],
        lowercase: true,
        trim: true
    },
    userEmail: {
        type: String,
        required: [true, 'User email id is required'],
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
    userPhone: {
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
    userCountryId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'User country is required'],
        trim: true
    },
    userProfile: {
        type: String
    },
    userPaymentCustomerId: {
        type: String,
        default: null
    }
}, {
    timestamps: true
})

const User = mongoose.model('User', userSchema);

module.exports = User;

// /* Add user check
// const user = new User({
//     userName: 'Daksh Ghetia',
//     userEmail: 'email1@gmail.com',
//     userPhone: '7043327239',
//     userCountryId: "6453a2a139a89665222b020c"
// })

// user.save().then((result) => {
//     console.log('User inserted successfully');
// }).catch((error) => {
//     console.log(error);
// });
// */