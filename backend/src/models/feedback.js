const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userFeedback: {
        type: String,
        required: [true, 'user feedback value is required for feedback'],
        trim: true,
    },
    feedbackRideId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Ride id is required for giving ride feedback'],
    }
}, {
    timestamps: true
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;