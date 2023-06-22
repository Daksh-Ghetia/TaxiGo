const express = require('express');
const auth = require('../middleware/authentication');
const multer = require('multer');
const { ObjectId } = require('mongodb');
const City = require('../models/city');

const router = new express.Router();
const upload = multer()

/**Get city details */
router.get('/city/GetCityDetails',auth, async (req,res) => {
    try {
        /**Create a pipeline for aggregatea and use it to send the data*/
        let pipeline = [
            {
                $lookup: {
                    from: 'countries',
                    as: 'country',
                    localField: 'countryId',
                    foreignField: '_id',
                }
            },
            {
                $sort: {
                    'country.countryName': 1,
                    'cityName': 1
                }
            }
        ];
        
        /**If there is list of cities to be obtained from the country id the insert match operation in the aggregate pipeline */
        if (req.query.countryId && req.query.countryId != "") {
            pipeline.splice(1, 0, {
                $match: {
                    "country._id": new ObjectId(req.query.countryId)
                }
            });
        }
        
        /**Find the city data if not found send not found message*/
        let city = await City.aggregate(pipeline);
        if (city.length === 0) {
            return res.status(404).send({msg: "No city to display", status: "failed"});
        }

        /**If data found send successs message */
        res.status(200).send({city: city, msg: 'City found', status: "success"})
    } catch (error) {
        res.status(500).send({msg: "Error occured while getting data of city", status: "failed", error: error});
    }
})

/**Add new City */
router.post('/city/AddNewCity', auth, upload.none(), async (req,res) => {
    try {        
        /**Create a new instance of type city and save it to database*/
        const city = new City({...req.body})

        /**If city data is not added then revert back with message, if data found save the data */
        if (!city) {
            return res.send(404).send({msg: "No data found while adding city", status: "failed"});
        }
        await city.save();

        /**Revert back to the user stating city added successfully */
        return res.status(200).send({city: city, msg: "City Added successfuly", status: "success"});
    } catch (error) {
        if (error.keyValue && error.keyValue.cityName) {
            return res.status(400).send({msg: 'City name is already registered', status: "failed", error: error});
        }
        res.status(500).send({msg: "Server error while adding city", status: "failed", error: error});
    }
})

/**Update the City */
router.patch('/city/editCity/:id', auth, upload.none(), async (req,res) => {
    try {
        /**Parse the body and store the keys of sent data */
        let updates = Object.keys(req.body);
        const allowedUpdates = ["cityName", "cityLatLng"];

        /**Check if the updates are applied for permissible  type only and if other update found return invalid updates*/
        const isValidOpertaion = updates.every((update) => allowedUpdates.includes(update));
        if (!isValidOpertaion) {
            return res.status(400).send({msg: "Invalid updates recived while updating city", status: "failed"})
        }

        /**find the city to update and if not found return city not found*/
        const city = await City.findOne({_id: req.params.id});
        if (!city) {
            return res.status(404).send({msg: "City not found for update", status: "failed"})
        }

        /**Apply updates to the field and save the data*/
        updates.forEach((update) => city[update] = req.body[update])
        await city.save();

        res.status(200).send({msg: "City edit success", city, status: "success"});
    } catch (error) {
        if (error.keyValue && error.keyValue.cityName) {
            return res.status(400).send({msg: 'City name is already registered', status: "failed", error: error});
        }
        res.status(500).send({msg: "Error occured while updating the city", error: error,status: "failed"});
    }
})

/**Delete the City */
router.delete('/city/deleteCity/:id', auth, async (req, res) => {
    try {
        /**Find the city by id and delete respective data*/
        const city = await City.findByIdAndDelete({_id: req.params.id});

        /**If city not found return message with city not found or else return the success message*/
        if (!city) {
            return res.status(404).send({msg: "City not found", status: "failed"});
        }
        res.status(200).send({City,msg: "City Deleted successfully", status: "success"});
    } catch (error) {
        res.status(500).send({msg: "Server error while deleting city"})
    }
})

/**Check zone
 * checks weather the given point is inside the zone or not
 */
router.get('/city/checkCity', auth, async (req,res) => {
    try {
        /**Get city data and if not found send message*/
        let city = await City.find({});
        if (city.length === 0) {
            return res.status(404).send({msg: "No city to check zone", status: "failed"});
        }

        /**Create a point to check if it exists inside the zone */
        let point = {lat: req.query.lat, lng: req.query.lng}
        
        /**Loop all the found city zones and if point is inside the zone then send city details else send pickup point outside the zone*/
        for (let i = 0; i < city.length; i++) {
            if (checkIsPointInsideZone(point, city[i])) {
                /**If data found send successs message */
                return res.status(200).send({city: city[i], msg: 'Pick up zone is permisible', status: "success"});
            }
        }
        return res.status(400).send({msg: 'Pick up point is outside permisibel limits', status: "failed"});

        /**Function to check the */
        function checkIsPointInsideZone(point, zone){
            var intersectCount = 0;
            var i,j;

            for (i = 0, j = zone.cityLatLng.length - 1; i < zone.cityLatLng.length; j = i++) {
                var xi = zone.cityLatLng[i].lng, yi = zone.cityLatLng[i].lat;
                var xj = zone.cityLatLng[j].lng, yj = zone.cityLatLng[j].lat;
                // Check if point is inside the polygon's bounding box
                if (((yi > point.lat) != (yj > point.lat)) && (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi)) {
                    /**Increment intersectCount if ray intersects with the edge*/
                    intersectCount++;
                }
            }
            /**Return true if intersectCount is odd, false otherwise */
            return (intersectCount % 2 == 1);
        }

    } catch (error) {
        res.status(500).send({msg: "Error occured while checking zone", status: "failed", error: error});
    }
})

module.exports = router;