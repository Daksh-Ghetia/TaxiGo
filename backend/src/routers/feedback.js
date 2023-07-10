const express = require('express');
const auth = require('../middleware/authentication');
const router = new express.Router();
const Feedback = require('../models/feedback');
const multer = require('multer');
const upload = multer()

router.get('/feedback/getFeedback', auth, async(req,res) => {
    try {
        const feedbackList = await Feedback.find({});

        if (feedbackList.length == 0) {
            return res.status(200).send({msg: "No feedbacks to display", status: "success"});
        }

        return res.status(200).send({feedbackList: feedbackList, msg: 'feedbacks found', status: "success"});
    } catch (error) {
        res.status(500).send({msg: "Error occured while getting feedback data", status: "failed", error: error});
    }
})

router.post('/feedback/newFeedback', auth, upload.none(), async (req,res) => {
    try {
        /**Create a new instance of type user and save it to database*/
        const feedback = new Feedback({
            ...req.body,
        })

        if (!feedback) {
            return res.status(404).send({msg: "No data found while giving feedback", status: "failed"})
        }
        await feedback.save();

        return res.status(200).send({feedback: feedback, msg: "Thankyou for your feedback", status: "success"});
    } catch (error) {
        console.log(error);
        res.status(500).send({msg: "Server error while adding feedback", status: "failed", error: error});
    }
})

module.exports = router