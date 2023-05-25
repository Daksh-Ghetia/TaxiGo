const express = require('express');
const cron = require('node-cron');
const Setting = require('../models/setting');
const Driver = require('../models/driver');
const Ride = require('../models/ride');

let timeToAcceptRequest;
let expression;

getSettingData();

async function getSettingData() {
    try {
        /**Find all the setting data and if not found return no data to display*/
        let setting = await Setting.find({});
        if (setting.length > 0) {
            timeToAcceptRequest = setting[0].timeToAcceptRequest;
            expression = `*/${timeToAcceptRequest} * * * * *`;
        }
    } catch (error) {}
}


cron.schedule('*/10 * * * * *', function () {
    getDriverData();
    assignNewDriver();
});

async function getDriverData() {
    try {
        /**Get the data of the driver who are having request currently */
        let drivers = await Driver.find({"driverRideStatus": 1});
        
        /**If no drivers are having  */
        if (drivers.length == 0) {
            return console.log("No driver in assigning state");
        }

        /**Update each and every driver and ride corresponding to it */
        drivers.forEach(async (driver) => {
            let currentTime = new Date();
            /**If the timer is equal to or past the limited time then update ride request */
            if ((((currentTime - driver.updatedAt) / 1000)+3) >= timeToAcceptRequest) {
                let sec = new Date().getSeconds();
                console.log("complete", sec);
                driver.driverRideStatus = 0;
                await driver.save();
                let ride = await Ride.findOne({rideDriverId: driver._id});
                if (ride) {
                    ride.rideNoActionByDriverId.push(driver._id);
                    ride.rideStatus = 1;
                    ride.rideDriverId = null;
                    await ride.save();
                }
            }
        });
    } catch (error) {
        console.log(error);
    }
}

async function assignNewDriver() {
    const ride = Ride.find({rideStatus: 1, $})
}