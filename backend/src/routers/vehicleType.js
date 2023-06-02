const express = require('express');
const auth = require('../middleware/authentication');
const VehicleType = require('../models/vehicleType');
const multer = require('multer');
const router = new express.Router();
const fs = require('fs');

const storage = multer.diskStorage({
    
    filename: function (req, file, cb) {  
        cb(null, Date.now() + " " + file.originalname);
    }
    ,
    destination: function (req, file, cb) {  
        cb(null, 'public/vehicleTypeImages');
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
}).single('vehicleIcon')

/**Function to handle the file upload */
const handleUpload = async(req, res, next) => {
    try {
        
        upload(req, res, (error) => {            
            /**If error thrown by multer then catch it and display it over here 
             * Else if the error is defined by developer then show that error
            */
            if (error instanceof multer.MulterError) {
                return res.status(500).send({msg: "File size greater than 10MB", status: "failed" ,error: error});
            } else if (error) {
                return res.status(500).send({msg: "Only .jpg, .jpeg, .png allowed", status: "failed", error: error});
            }

            /**If file is not uploaded while updating then it is okay */
            if (req.url.includes('/editVehicle') && !req.file) {
               return next();
            }
            /**If file is not uploaded while adding new vehicle type throw error */
            if (!req.file) {
                return res.status(404).send({msg: "Please upload image file to proceed", status: "failed"});
            }
            /**Update the updated name of file to the body */
            req.body.vehicleIcon = req.file.filename;
            next();
        });
    } catch (error) {
        return res.status(500).send({msg: "Server error while uploading file", status: "failed", error: error});
    }
}

const deleteFile = (imagePath) => {
    fs.unlink("public/vehicleTypeImages/" + imagePath, (error) => {
        /**Without this function file is not deleted */
    });
}

router.get('/vehicle/getData', auth, async (req, res) => {
    res.status(200).send({msg: "Authentication successful"});
})

/**Get vehicle type data */
router.get('/vehicle/getVehicleDetails', auth, async (req, res) => {
    try {
        /**Find all the vehicle data and if not found return data to display*/
        let vehicle = await VehicleType.find({});
        if (!vehicle) {
            return res.status(404).send({msg: "No vehicle type to display", status: "failed"});
        }

        /**If data found send the data */
        res.status(200).send({vehicle: vehicle, msg: 'vehicle Type found', status: "success"})

    } catch (error) {
        res.status(500).send({msg: "Error occured while getting data of vehicle type", status: "failed", error: error});
    }
})

/**Add new vehicle type */
router.post('/vehicle/addVehicle', auth, handleUpload, async (req,res) => {
    try {
        /**Create a new instance of type vehicle and save it to database*/
        const vehicleType = new VehicleType({
            ...req.body,
        })

        if (!vehicleType) {
            return res.status(404).send({msg: "No data found", status: "failed"})
        }
        await vehicleType.save();

        /**Revert back to the user stating vehicle type added successfully */
        return res.status(200).send({vehicleType: vehicleType, msg: "vehicle added successfully", status: "success"});
    } catch (error) {
        if (req.file) {
            if (req.file.filename) {
                deleteFile(req.file.filename);
            }
        }
        if (error.keyValue && error.keyValue.vehicleName) {
            res.status(400).send({msg: "vehicle Type is already registered", status: "failed", error: error})
        } else {
            res.status(500).send({msg: "Server error while adding vehicle", status: "failed", error: error});            
        }
    }
})

/**Update the vehicle type */
router.patch('/vehicle/editVehicle/:id', auth, handleUpload, async(req,res) => {
    try {
        /**Parse the body and store the keys of sent data */
        let updates = Object.keys(req.body);
        const allowedUpdates = ["vehicleName", "vehicleIcon"];

        /**Check if the updates are applied for permissible  type only and if other update found return invalid updates*/
        const isValidOpertaion = updates.every((update) => allowedUpdates.includes(update));
        if (!isValidOpertaion) {
            return res.status(400).send({msg: "Invalid updates", status: "failed"})
        }

        /**find the vehicle to update and if not found return vehicle type not found*/
        const vehicleType = await VehicleType.findOne({_id: req.params.id});
        if (!vehicleType) {
            return res.status(404).send({msg: "vehicle type not found for update", status: "failed"})
        }

        /**If file is also updated remove previously added file */
        if (req.file) {
            if (vehicleType.vehicleIcon) {
                deleteFile(vehicleType.vehicleIcon);
            }
            vehicleType.vehicleIcon = req.file.filename;
        }
        
        /**Apply updates to the field and save the data*/
        updates.forEach((update) => vehicleType[update] = req.body[update])
        await vehicleType.save();
        
        res.status(200).send({msg: "Edit success", vehicleType, status: "success"});
    } catch (error) {
        if (req.file) {
            if (req.file.filename) {
                deleteFile(req.file.filename);
            }
        }
        if (error.keyValue && error.keyValue.vehicleName) {
            res.status(400).send({msg: "vehicle Type is already registered", status: "failed", error: error})
        } else {
            res.status(500).send({msg: "Error occured while updating the vehicle type", status: "failed"});
        }
    }       
})

/**Delete vehicle type */
router.delete('/vehicle/deleteVehicle/:id', auth, async (req, res) => {
    try {
        /**Find the vehicle type by id and delete respective data*/
        const vehicleType = await VehicleType.findByIdAndDelete({_id: req.params.id});

        /**If vehicle not found return message with vehicle type not found */
        if (!vehicleType) {
            return res.status(404).send({msg: "vehicle type not found", status: "failed"});
        }

        /**Delete the file associated with the vehicle type and respond back */
        if (vehicleType.vehicleIcon) {
            deleteFile(vehicleType.vehicleIcon);
        }

        res.status(200).send({vehicleType: vehicleType,msg: "vehicle Deleted successfully", status: "success"});
    } catch (error) {
        res.status(500).send({error, msg: "Server error while deleting vehicle type", status: "failed"})
    }
})

module.exports = router