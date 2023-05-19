const express = require('express');
const auth = require('../middleware/authentication');
const multer = require('multer');
const Ride = require('../models/ride');

const router = new express.Router();

const upload = multer();

/**Get ride data */
router.get('/ride/getRideDetails', auth, async (req, res) => {
    try {
        let pipeline = [
            {
                $lookup: {
                             from: 'users',
                             as: 'user',
                             localField: 'rideCustomerId',
                             foreignField: '_id'
                         }
            },
            {
                $lookup: {
                    from: 'countries',
                    as: 'country',
                    localField: 'user.userCountryId',
                    foreignField: '_id'
                }
            },
            // {
            //     $match: {
            //         $or: [
            //             {}
            //         ]
            //     }
            // },
            {
                $lookup: {
                    from: 'vehicletypes',
                    as: 'vehicleType',
                    localField: 'rideServiceTypeId',
                    foreignField: '_id'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $unwind: '$vehicleType'
            }
        ]

        /**Find all the ride data and if not found return no data to display*/
        let ride = await Ride.aggregate(pipeline);
        if (!ride) {
            return res.status(404).send({msg: "No ride to display", status: "failed"});
        }

        /**If data found send the data */
        res.status(200).send({ride: ride, msg: 'ride found', status: "success"})
    } catch (error) {
        res.status(500).send({msg: "Error occured while getting data of ride", status: "failed", error: error});
    }
})

/**Add new ride */
router.post('/ride/addRide', auth, upload.none(), async (req,res) => {
    try {
        /**Create a new instance of type ride and save it to database*/
        const ride = new Ride({
            ...req.body,
        })

        if (!ride) {
            return res.status(404).send({msg: "No data found while adding ride", status: "failed"})
        }
        await ride.save()

        /**Revert back to the admin stating ride added successfully */
        return res.status(200).send({ride: ride, msg: "Ride added successfully", status: "success"});
    } catch (error) {
        res.status(500).send({msg: "Server error while adding ride", status: "failed", error: error});
    }
})

/**Update the Ride */
router.patch('/ride/editRide/:id', auth, upload.none(), async(req,res) => {
    try {
        /**Parse the body and store the keys of sent data */
        let updates = Object.keys(req.body);
        const allowedUpdates = ["rideStatus", "rideDriverId"];

        /**Check if the updates are applied for permissible  type only and if other update found return invalid updates*/
        const isValidOpertaion = updates.every((update) => allowedUpdates.includes(update));
        if (!isValidOpertaion) {
            return res.status(400).send({msg: "Invalid updates while updating ride", status: "failed"})
        }

        /**find the ride to update and if not found return ride not found*/
        const ride = await Ride.findOne({_id: req.params.id});
        if (!ride) {
            return res.status(404).send({msg: "Ride not found for update", status: "failed"})
        }
        
        /**Apply updates to the field and save the data*/
        updates.forEach((update) => ride[update] = req.body[update])
        await ride.save();
        
        res.status(200).send({msg: "Edit success", ride: ride, status: "success"});
    } catch (error) {
        res.status(500).send({msg: "Server error while adding ride", status: "failed", error: error});
    }       
})

module.exports = router