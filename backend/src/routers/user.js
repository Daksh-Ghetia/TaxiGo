const express = require('express');
const auth = require('../middleware/authentication');
const User = require('../models/user.js');
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
        cb(null, 'public/userImages/');
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
}).single('userProfile')

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
            req.body.userProfile = req.file.filename;
            next();
        });
    } catch (error) {
        return res.status(500).send({msg: "Server error while uploading file", status: "failed", error: error});
    }
}

const deleteFile = (imagePath) => {
    fs.unlink("public/userImages/" + imagePath, (error) => {
        /**Without this function file is not deleted */
    });
}

/**Get user data */
router.get('/user/getUserDetails', auth, async (req, res) => {
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
                $match:{
                    $or: [
                        {userName: {$regex: regexp}},
                        {userPhone: {$regex: regexp}},
                        {userCountryCode: {$regex: regexp}},
                        {userCountry: {$regex: regexp}},
                        {userEmail: {$regex: regexp}},
                        {_id: dataID},
                    ]
                }
            },
            {
                $lookup: {
                    from: 'countries',
                    as: 'country',
                    localField: 'userCountryId',
                    foreignField: '_id',
                }
            },
            {
                $unwind: '$country'
            },
        ];

        /**Find all the user data and if not found return no data to display*/
        let user = await User.aggregate(pipeline);
        if (!user) {
            return res.status(404).send({msg: "No user to display", status: "failed"});
        }

        /**If data found send the data */
        res.status(200).send({user: user, msg: 'User found', status: "success"})
    } catch (error) {
        res.status(500).send({msg: "Error occured while getting data of Users", status: "failed", error: error});
    }
})

/**Add new User */
router.post('/user/addUser', auth, handleUpload, async (req,res) => {
    try {
        /**Create a new instance of type user and save it to database*/
        const user = new User({
            ...req.body,
        })

        if (!user) {
            return res.status(404).send({msg: "No data found while adding user", status: "failed"})
        }
        await user.save()

        /**Revert back to the user stating user added successfully */
        return res.status(200).send({user: user, msg: "User added successfully", status: "success"});
    } catch (error) {
        if (req.file) {
            if (req.file.filename) {
                deleteFile(req.file.filename);
            }
        }

        if (error.errors && error.errors.userEmail) {
            res.status(400).send({msg: error.errors.userEmail.message, status: "failed", error: error});
        } else if (error.errors && error.errors.userPhone) {
            res.status(400).send({message: error.errors.userPhone.message, status: "failed", error: error});
        } else if (error.keyValue && error.keyValue.userEmail) {
            res.status(400).send({message: "Email is already registered", status: "failed", error: error})
        } else if (error.keyValue && error.keyValue.userPhone) {
            res.status(400).send({message: 'phone number is already registered', status: "failed", error: error})
        } else {
            res.status(500).send({msg: "Server error while adding User", status: "failed", error: error});
        }
    }
})

/**Update the User */
router.patch('/user/editUser/:id', auth, handleUpload, async(req,res) => {
    try {
        /**Parse the body and store the keys of sent data */
        let updates = Object.keys(req.body);
        const allowedUpdates = ["userName", "userEmail", "userPhone", "userCountryId", "userProfile"];

        /**Check if the updates are applied for permissible  type only and if other update found return invalid updates*/
        const isValidOpertaion = updates.every((update) => allowedUpdates.includes(update));
        if (!isValidOpertaion) {
            return res.status(400).send({msg: "Invalid updates while updating user", status: "failed"})
        }

        /**find the user to update and if not found return user type not found*/
        const user = await User.findOne({_id: req.params.id});
        if (!user) {
            return res.status(404).send({msg: "User not found for update", status: "failed"})
        }

        /**If file is also updated remove previously added file */
        if (req.file) {
            if (user.userProfile) {
                deleteFile(user.userProfile);
            }
            user.userProfile = req.file.filename;
        }
        
        /**Apply updates to the field and save the data*/
        updates.forEach((update) => user[update] = req.body[update])
        await user.save();
        
        res.status(200).send({msg: "Edit success", user: user, status: "success"});
    } catch (error) {
        if (req.file) {
            if (req.file.filename) {
                deleteFile(req.file.filename);
            }
        }

        if (error.errors && error.errors.userEmail) {
            res.status(400).send({msg: error.errors.userEmail.message, status: "failed", error: error});
        } else if (error.errors && error.errors.userPhone.message) {
            res.status(400).send({message: error.errors.userPhone.message, status: "failed", error: error});
        } else if (error.keyValue && error.keyValue.userEmail) {
            res.status(400).send({message: "Email is already registered", status: "failed", error: error})
        } else if (error.keyValue && error.keyValue.userPhone) {
            res.status(400).send({message: 'phone number is already registered', status: "failed", error: error})
        } else {
            res.status(500).send({msg: "Server error while updating User", status: "failed", error: error});
        }
    }       
})

/**Delete user type */
router.delete('/user/deleteUser/:id', auth, async (req, res) => {
    try {
        /**Find the User by id and delete respective data*/
        const user = await User.findByIdAndDelete({_id: req.params.id});

        /**If user not found return message with user not found */
        if (!user) {
            return res.status(404).send({msg: "User not found", status: "failed"});
        }

        /**Delete the file associated with the user and respond back */
        if (user.userProfile) {
            deleteFile(user.userProfile);
        }

        res.status(200).send({user: user,msg: "User Deleted successfully", status: "success"});
    } catch (error) {
        res.status(500).send({error, msg: "Server error while deleting User", status: "failed"})
    }
})

module.exports = router