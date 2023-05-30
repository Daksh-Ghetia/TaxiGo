const express = require('express');
const cron = require('node-cron');
const Setting = require('../models/setting');
const SocketIo = require('./socket-io');
const Driver = require('../models/driver');
const Ride = require('../models/ride');

let timeToAcceptRequest;

cron.schedule('*/30 * * * * *', function () {
    getDriverData();
    assignNewDriver();
});

/**Get the data necessary for the further execution */
async function getSettingData() {
    try {
        /**Find all the setting data and if not found return no data to display*/
        let setting = await Setting.find({});
        if (setting.length > 0) {
            timeToAcceptRequest = setting[0].timeToAcceptRequest;
        }
    } catch (error) {}
}
getSettingData();

async function getDriverData() {
    try {
        /**Get the data of the driver who are having request currently */
        let drivers = await Driver.find({"driverRideStatus": 1}).sort({updatedAt: 1});
        
        /**If no drivers are having  */
        if (drivers.length == 0) {
            return
            // return console.log("No driver in assigning state");
        }

        /**Update each and every driver and ride corresponding to it */
        drivers.forEach(async (driver) => {
            freeDriver(driver);
        });
    } catch (error) {
        console.log(error);
    }
}

/**Free Driver */
function freeDriver(driver) {
    async function checkCondition() {
        if ((Math.floor((new Date() - driver.updatedAt)/1000)) >= timeToAcceptRequest) {
            let currenttSecond = new Date().getSeconds();
            console.log(currenttSecond);
            driver.driverRideStatus = 0;
            await driver.save();
            let ride = await Ride.findOne({rideDriverId: driver._id});
            if (ride) {
                ride.rideNoActionByDriverId.push(driver._id);
                ride.rideStatus = 1;
                ride.rideDriverId = null;
                await ride.save();
                SocketIo.socketEmit('dataChange');
            }
        } else {
            setImmediate(checkCondition);
        }
    }
    checkCondition();
}

/**Assign new driver */
async function assignNewDriver() {
    const ride = await Ride.find({rideStatus: 1, rideDriverAssignType: 2});
    if (ride.length == 0) {
        return console.log("No ride with random driver assign");
    }
    // console.log(ride);
}
