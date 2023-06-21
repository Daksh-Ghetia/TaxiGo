const express = require('express');
const Driver = require('../models/driver');
const auth = require('../middleware/authentication');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const fs = require('fs');

const router = new express.Router();

const storage = multer.diskStorage({
    filename: function (req, file, cb) {  
        cb(null, Date.now() + " " + file.originalname);
    }
    ,
    destination: function (req, file, cb) {  
        cb(null, 'public/driverImages/');
    },
})

const upload = multer({
    storage: storage, 
    limits:{
        fileSize: 1000000
    },
    fileFilter(req,file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('please upload a jpg, jpeg or png file only'));
        }
        cb(undefined, true)
    },
}).single('driverProfile')

/**Function to handle the file upload */
const handleUpload = async(req, res, next) => {
    try {
        upload(req, res, (error) => {
            if (!req.file) {
                return next();
            }

            /**If error thrown by multer then catch it and display it over here 
             * Else if the error is defined by developer then show that error
            */
            if (error instanceof multer.MulterError) {
                return res.status(500).send({msg: "File size greater than 10MB", status: "failed" ,error: error});
            } else if (error) {
                return res.status(500).send({msg: "Only .jpg, .jpeg, .png allowed", status: "failed", error: error});
            }

            /**Update the updated name of file to the body */
            req.body.driverProfile = req.file.filename;
            next();
        });
    } catch (error) {
        return res.status(500).send({msg: "Server error while uploading file", status: "failed", error: error});
    }
}

const deleteFile = (imagePath) => {
    fs.unlink("public/driverImages/" + imagePath, (error) => {
        /**Without this function file is not deleted */
    });
}

/**Get driver data */
router.get('/driver/getDriverDetails', auth, async (req, res) => {
    const data = req.query.data;
    let dataID;

    if (typeof data === 'string' && (data.length == 12 || data.length == 24) && ObjectId.isValid(data)) {
        dataID = new ObjectId(data);
    }

    try {
        const searchQuery = req.query.data;
        const escapedQuery = searchQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regexp = new RegExp(escapedQuery, "i");

        let pipeline = [
            {
                $lookup: {
                    from: 'countries',
                    as: 'country',
                    localField: 'driverCountryId',
                    foreignField: '_id',
                }
            },
            {
                $match:{
                    $or: [
                        {driverName: {$regex: regexp}},
                        {driverEmail: {$regex: regexp}},
                        {driverPhone: {$regex: regexp}},
                        {'country.countryCode': {$regex: regexp}},
                        {_id: dataID},
                    ]
                }
            },
            {
                $lookup: {
                    from: 'cities',
                    as: 'city',
                    localField: 'driverCityId',
                    foreignField: '_id'
                }
            },
            {
                $lookup: {
                    from: 'vehicletypes',
                    as: 'vehicleType',
                    localField: 'driverServiceTypeId',
                    foreignField: '_id',
                }
            },
            {
                $unwind: '$country'
            },
            {
                $unwind: '$city'
            },
            {
                $facet: {
                    totalCount: [
                        {
                            $group: {
                                _id: null,
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                count: 1
                            }
                        }
                    ],
                    paginatedData: [
                        { $skip: req.query.pagenumber* 10 },
                        { $limit: 10 }
                    ]
                }
            },
            {
                $unwind: '$totalCount'
            },
            {
                $project: {
                    totalCount: '$totalCount.count',
                    paginatedData: 1
                }
            }
        ];

        /**Find all the driver data and if not found return no data to display*/
        let driver = await Driver.aggregate(pipeline);
        if (driver.length <= 0) {
            return res.status(404).send({msg: "No driver to display", status: "failed"});
        }
        
        /**If data found send the data */
        res.status(200).send({driver: driver[0].paginatedData, totalRecord: driver[0].totalCount, msg: 'Driver found', status: "success"});
    } catch (error) {
        console.log(error);
        res.status(500).send({msg: "Error occured while getting data of driver", status: "failed", error: error});
    }
})

/**Add new Driver */
router.post('/driver/addDriver', auth, handleUpload, async (req,res) => {
    try {
        /**Create a new instance of type driver and save it to database*/
        const driver = new Driver({
            ...req.body,
        })

        if (!driver) {
            return res.status(404).send({msg: "No data found while adding driver", status: "failed"})
        }
        await driver.save()

        /**Revert back to the admin stating driver added successfully */
        return res.status(200).send({driver: driver, msg: "Driver added successfully", status: "success"});
    } catch (error) {
        if (req.file) {
            if (req.file.filename) {
                deleteFile(req.file.filename);
            }
        }

        console.log(error);
        if (error.errors && error.errors.driverEmail) {
            res.status(400).send({msg: error.errors.driverEmail.message, status: "failed", error: error});
        } else if (error.errors && error.errors.driverPhone) {
            res.status(400).send({msg: error.errors.driverPhone.message, status: "failed", error: error});
        } else if (error.keyValue && error.keyValue.driverEmail) {
            res.status(400).send({msg: "Email is already registered", status: "failed", error: error})
        } else if (error.keyValue && error.keyValue.driverPhone) {
            res.status(400).send({msg: 'phone number is already registered', status: "failed", error: error})
        } else {
            res.status(500).send({msg: "Server error while adding Driver", status: "failed", error: error});
        }
    }
})

/**Update the Driver */
router.patch('/driver/editDriver/:id', auth, handleUpload, async(req,res) => {
    try {
        /**Parse the body and store the keys of sent data */
        let updates = Object.keys(req.body);
        const allowedUpdates = ["driverName", "driverEmail", "driverPhone", "driverCountryId", "driverCityId", "driverServiceTypeId", "driverStatus", "driverRideStatus", "driverProfile"];

        /**Check if the updates are applied for permissible  type only and if other update found return invalid updates*/
        const isValidOpertaion = updates.every((update) => allowedUpdates.includes(update));
        if (!isValidOpertaion) {
            return res.status(400).send({msg: "Invalid updates while updating driver", status: "failed"})
        }

        /**find the driver to update and if not found return driver not found*/
        const driver = await Driver.findOne({_id: req.params.id});
        if (!driver) {
            return res.status(404).send({msg: "Driver not found for update", status: "failed"})
        }

        /**If file is also updated remove previously added file */
        if (req.file) {
            if (driver.driverProfile) {
                deleteFile(driver.driverProfile);
            }
            driver.driverProfile = req.file.filename;
        }
        /**Make driver status boolean from string */
        req.body.driverStatus = req.body.driverStatus === 'true';

        /**Update the driverServiceTypeId as null if it is string */
        if (req.body["driverServiceTypeId"] === 'null') req.body["driverServiceTypeId"] = null;
        /**Apply updates to the field and save the data*/
        updates.forEach((update) => driver[update] = req.body[update])
        await driver.save();
        
        res.status(200).send({msg: "Edit success", driver: driver, status: "success"});
    } catch (error) {
        if (req.file) {
            if (req.file.filename) {
                deleteFile(req.file.filename);
            }
        }

        if (error.errors && error.errors.driverEmail) {
            res.status(400).send({msg: error.errors.driverEmail.message, status: "failed", error: error});
        } else if (error.errors && error.errors.driverPhone) {
            res.status(400).send({msg: error.errors.driverPhone.message, status: "failed", error: error});
        } else if (error.keyValue && error.keyValue.driverEmail) {
            res.status(400).send({msg: "Email is already registered", status: "failed", error: error})
        } else if (error.keyValue && error.keyValue.driverPhone) {
            res.status(400).send({msg: 'phone number is already registered', status: "failed", error: error})
        } else {
            res.status(500).send({msg: "Server error while adding Driver", status: "failed", error: error});
        }
    }       
})

/**Delete driver type */
router.delete('/driver/deleteDriver/:id', auth, async (req, res) => {
    try {
        /**Find the Driver by id and delete respective data*/
        const driver = await Driver.findByIdAndDelete({_id: req.params.id});

        /**If driver not found return message with driver not found */
        if (!driver) {
            return res.status(404).send({msg: "Driver not found", status: "failed"});
        }

        /**Delete the file associated with the driver and respond back */
        if (driver.driverProfile) {
            deleteFile(driver.driverProfile);
        }

        res.status(200).send({driver: driver,msg: "Driver Deleted successfully", status: "success"});
    } catch (error) {
        res.status(500).send({error, msg: "Server error while deleting Driver", status: "failed"})
    }
})

/**Get list of all available drivers for ride*/
router.get('/driver/getDriverDetailsForRide', auth, async (req, res) => {
    try {

        let pipeline = [
            {
                $match : {
                    $and: [
                        { driverStatus: true },
                        { driverRideStatus: 0},
                        { driverServiceTypeId: new ObjectId(req.query.rideServiceTypeId)},
                        {driverCityId: new ObjectId(req.query.rideCityId)},
                    ]
                }
            }
        ];

        /**Find all the driver data and if not found return no data to display*/
        let driver = await Driver.aggregate(pipeline);
        if (!driver) {
            return res.status(404).send({msg: "No driver to display", status: "failed"});
        }

        /**If data found send the data */
        res.status(200).send({driver: driver, msg: 'Driver found', status: "success"});
    } catch (error) {
        res.status(500).send({msg: "Error occured while getting data of driver", status: "failed", error: error});
    }
})

module.exports = router