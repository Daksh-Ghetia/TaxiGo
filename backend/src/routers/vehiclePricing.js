const express = require('express');
const auth = require('../middleware/authentication');
const VehiclePricing = require('../models/vehiclePricing');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const router = new express.Router();

const upload = multer()

router.get('/vehiclePricing/getVehiclePricing', auth, async (req,res) => {
    try {
        /**Create a pipeline for aggregatea and use it to send the data*/
        let pipeline = [
            {
                $lookup: {
                    from: 'countries',
                    as: 'country',
                    localField: 'countryId',
                    foreignField: '_id'
                }
            },
            {
                $lookup: {
                    from: 'cities',
                    as: 'city',
                    localField: 'cityId',
                    foreignField: '_id'
                }
            },
            {
                $lookup: {
                    from: 'vehicletypes',
                    as: 'vehicleType',
                    localField: 'vehicleTypeId',
                    foreignField: '_id'
                }
            },
            {
                $unwind: '$country'
            },
            {
                $unwind: '$city'
            },
            {
                $unwind: '$vehicleType'
            },
            {
                $sort: {
                    "country.countryName": 1,
                    "city.cityName": 1,
                    "vehicleType.vehicleName": 1
                }
            }
        ];
        
        if (req.query.cityId && req.query.cityId != "") {
            pipeline.splice(3,0, {
                $match: {
                    "city._id": new ObjectId(req.query.cityId)
                }
            });
        }       
        
        /**Find the vehicle pricing data if not found send not found message*/
        let vehiclePricing = await VehiclePricing.aggregate(pipeline);
        if (vehiclePricing.length === 0) {
            return res.status(404).send({msg: "No vehicle pricing to display", status: "failed"});
        }

        /**If data found send successs message */
        res.status(200).send({vehiclePricing: vehiclePricing, msg: 'Vehicle pricing found', status: "success"})
    } catch (error) {
        console.log(error);
        res.status(500).send({msg: "Error occured while getting data of vehicle pricing", status: "failed", error: error});
    }
})

router.post('/vehiclePricing/addVehiclePricing', auth, upload.none(), async (req,res) => {
    try {
        /**Check if the vehicle type is registered  inside country and city or not, if registered don't save the data and revert back*/
        let checkClone = await VehiclePricing.find({countryId: req.body.countryId, cityId: req.body.cityId, vehicleTypeId: req.body.vehicleTypeId})
        if (checkClone.length > 0) {
            return res.status(400).send({msg: "Vehicle type is already registered for city ", status: "failed"});
        }

        /**Create a new instance of type vehiclePricing and save it to database*/
        const vehiclePricing = new VehiclePricing({...req.body})

        /**If vehicle Pricing data is not added then revert back with message, if data found save the data */
        if (!vehiclePricing) {
            return res.send(404).send({msg: "No data found while adding vehicle pricing", status: "failed"});
        }
        await vehiclePricing.save();

        /**Revert back to the user stating vehicle pricing added successfully */
        return res.status(200).send({vehiclePricing: vehiclePricing, msg: "Vehicle pricing added successfuly", status: "success"});
    } catch (error) {
        res.status(500).send({msg: "Server error while adding vehicle pricing", status: "failed", error: error});
    }
})

router.patch('/vehiclePricing/updateVehiclePricing/:id', auth, upload.none(), async (req,res) => {
    try {
        /**Parse the body and store the keys of sent data */
        let updates = Object.keys(req.body);
        const allowedUpdates = ["driverProfit", "minimumFare", "distanceForBasePrice", "basePrice", "pricePerUnitDistance", "pricePerUnitTime", "maxSpace"];

        /**Check if the updates are applied for permissible vehicle pricing only and if other update found return invalid updates*/
        const isValidOpertaion = updates.every((update) => allowedUpdates.includes(update));
        if (!isValidOpertaion) {
            return res.status(400).send({msg: "Invalid updates recived while updating vehicle pricing", status: "failed"})
        }

        /**find the vehicle pricing to update and if not found return not found*/
        const vehiclePricing = await VehiclePricing.findOne({_id: req.params.id})
        if (!vehiclePricing) {
            return res.status(404).send({msg: "Vehicle Pricing not found for update", status: "failed"})
        }

        /**Apply updates to the field and save the data*/
        updates.forEach((update) => vehiclePricing[update] = req.body[update])
        await vehiclePricing.save();

        return res.status(200).send({msg: "Vehicle pricing edit success", vehiclePricing, status: "success"});
    } catch (error) {
        res.status(500).send({msg: "Error occured while updating the vehicle pricing", error: error, status: "failed"});
    }
})

/**Delete the vehicle pricing */
router.delete('/vehiclePricing/deleteVehiclePricing/:id', auth, async (req, res) => {
    try {
        /**Find the vehicle Pricing by id and delete respective data*/
        const vehiclePricing = await VehiclePricing.findByIdAndDelete({_id: req.params.id});

        /**If vehicle Pricing not found return message with vehicle Pricing not found or else return the success message*/
        if (!vehiclePricing) {
            return res.status(404).send({msg: "Vehicle Pricing not found", status: "failed"});
        }
        res.status(200).send({vehiclePricing: vehiclePricing, msg: "Vehicle Pricing Deleted successfully", status: "success"});
    } catch (error) {
        res.status(500).send({msg: "Server error while deleting vehicle Pricing"})
    }
})

/**Calculate ride fare */
router.get('/vehiclePricing/calculatePricing/:id', auth, async (req,res) => {
    try {
        /**Find the vehicle pricing and if not found return error*/
        const vehiclePricing = await VehiclePricing.findOne({_id: req.params.id});
        if (!vehiclePricing) {
            return res.status(400).send({msg: "Vehicle pricing not found for update", status: "failed"})
        }

        /**Calculate total fare */
        let totalFare = vehiclePricing.basePrice + ((req.query.distance - vehiclePricing.distanceForBasePrice)* vehiclePricing.pricePerUnitDistance) + (req.query.  time * vehiclePricing.pricePerUnitTime);

        /**If total fare is less than minimum fare return minimum fare 
         * and if total fare is greater return total fare
         */
        if (totalFare < vehiclePricing.minimumFare) {
            return res.status(200).send({totalFare: vehiclePricing.minimumFare, msg: 'total fare calculation succesful', status: 'success'})
        } else {
            return res.status(200).send({totalFare: totalFare, msg: 'total fare calculation succesful', status: 'success'})
        }
    } catch (error) {
        return res.status(500).send({msg: "Error occured while calculating ride fare", error: error, status: "failed"});
    }
})

module.exports = router;