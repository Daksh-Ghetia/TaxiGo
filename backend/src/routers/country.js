const express = require('express');
const auth = require('../middleware/authentication');
const multer = require('multer');
const Country = require('../models/country');

const router = new express.Router();

const upload = multer()

router.get('/', async (req,res) => {
    res.send("Callled Country")
})

router.get('/country/GetCountryDetails', auth, async (req, res) => {
    try {
        const searchQuery = new RegExp(req.query.countryName, "i");
        
        let country = await Country.find({countryName: searchQuery});
        
        if (country.length === 0) {
            return res.status(404).send({msg: "No country to display", status: "failed"});
        }
        
        /**If data found send the data */
        res.status(200).send({country: country, msg: 'Country found', status: "success"})
    } catch (error) {
        res.status(500).send({msg: "Error occured while getting data of country", status: "failed", error: error});
    }
})

/**Add new country */
router.post('/country/AddNewCountry', auth, upload.none(),  async (req,res) => {
    try {
        /**Create a new instance of type country and save it to database*/
        const country = new Country({
            ...req.body,
        });

        if (!country) {
            return res.send(404).send({msg: "No data found while adding country", status: "failed"});
        }
        await country.save();

        /**Revert back to the user stating country added successfully */
        return res.status(200).send({country: country, msg: "Country Added successfuly", status: "success"});
    } catch (error) {
        if (error.keyValue && error.keyValue.countryName) {
            res.status(400).send({msg: "Country is already registered", status: "failed", error: error});
        } else {
            res.status(500).send({msg: "Server error while adding country", status: "failed", error: error});
        }
    }
})

/**Delete Country */
router.delete('/country/DeleteCountry/:id', auth, async (req,res) => {
    try {
        /**Find the country by id and delete respective data*/
        const country = await Country.findByIdAndDelete({_id: req.params.id});

        /**If country not found return message with country not found */
        if (!country) {
            return res.status(400).send({msg: "Country not found", status: "failed"});
        }

        /**Send the success message for country deletion  */
        res.status(200).send({country,msg: "Country deleted successfully", status: "success"});
    } catch (error) {
        res.status(500).send({error: error, msg: "Server error while deleting country", status: "failed"})
    }
})

module.exports = router