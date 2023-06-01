const express = require('express');
const auth = require('../middleware/authentication');
const multer = require('multer');
const Setting = require('../models/setting');
const SocketIo = require('./socket-io');
const Cron = require('../routers/crone');

const router = new express.Router();

const upload = multer()

/**Get setting data */
router.get('/setting/getSettingDetails', auth, async (req, res) => {
    try {
        /**Find all the setting data and if not found return no data to display*/
        let setting = await Setting.find({});
        if (!setting) {
            return res.status(404).send({msg: "No setting data to display", status: "failed"});
        }

        /**If data found send the data */
        res.status(200).send({setting: setting, msg: 'Setting data found', status: "success"})
    } catch (error) {
        res.status(500).send({msg: "Error occured while getting data of setting", status: "failed", error: error});
    }
})

/**Update the Setting */
router.patch('/setting/editSetting/:id', auth, upload.none(), async(req,res) => {
    try {
        /**Parse the body and store the keys of sent data */
        let updates = Object.keys(req.body);
        const allowedUpdates = ["timeToAcceptRequest", "stopsInBetweenDestination"];

        /**Check if the updates are applied for permissible  type only and if other update found return invalid updates*/
        const isValidOpertaion = updates.every((update) => allowedUpdates.includes(update));
        if (!isValidOpertaion) {
            return res.status(400).send({msg: "Invalid updates while updating setting", status: "failed"})
        }

        /**find the setting to update and if not found return setting not found*/
        const setting = await Setting.findOne({_id: req.params.id});
        if (!setting) {
            return res.status(404).send({msg: "Setting not found for update", status: "failed"})
        }
        
        /**Apply updates to the field and save the data*/
        updates.forEach((update) => setting[update] = req.body[update])
        await setting.save();
        Cron.getSettingData();
        return res.status(200).send({msg: "Edit success", setting: setting, status: "success"});

    } catch (error) {
        res.status(500).send({msg: "Server error while updating setting", status: "failed", error: error});
    }       
})

module.exports = router