const express = require('express');
const Admin = require('../models/admin');
const auth = require('../middleware/authentication');

const router = new express.Router();

router.get('',async (req,res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send({msg: "Success"});
})

router.post('', async (req,res) => {
    res.send({msg: "Data recived"});
})

router.get('/after', auth, async(req,res) => {
    res.send({msg: "User authenticated"})
})

/**Add new admin to the collection */
router.post('/admin/signup', async (req,res) => {
    // create a new object with prescribed schema of admin collection and pass data to the constructor
    const admin = new Admin(req.body)

    try {
        // call the method to add the data to the collection
        await admin.save()
        const token = await admin.generateAuthToken();
        res.status(200).send({admin, token});
    } catch (error) {
        res.status(400).send("Error: " + error);
    }
})

router.post('/admin/login', async (req,res) => {
    try {
        const admin = await Admin.findByCredentials(req.body.email,req.body.password)
        if (!admin) {
            return res.status(200).send({msg: "User not found"})
        }
        const token = await admin.generateAuthToken();
        res.status(200).send({admin, token, msg: 'Authentication successful'})
    } catch (error) {
        res.status(500).send({msg: 'Authentication failed', error: error})
    }
})

router.post('/admin/logout', auth, async (req, res) => {
    try {
        req.admin.tokens = req.admin.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.admin.save();

        res.status(200).send({msg: "You have been logged out of the system"});
    } catch (error) {
        res.status(500).send({msg: "Failed to log out"});
    }
});

router.post('/admin/logoutALL', auth, async (req, res) => {

    try {
        req.admin.tokens = [];

        await req.admin.save();

        res.status(200).send({msg: "Successfully logged out from all devices"});
    } catch (error) {
        res.status(500).send("Failed to log-out from all sessions");
    }
});

module.exports = router