const express = require('express');
const cron = require('node-cron');
const Setting = require('../models/setting');
const SocketIo = require('./socket-io');
const Driver = require('../models/driver');
const Ride = require('../models/ride');
const { ObjectId } = require('mongodb');

let timeToAcceptRequest;

cron.schedule('*/10 * * * * *', async function () {
    await getDriverData();
    await assignNewDriver();
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
        let rides = await Ride.find({"rideStatus": 3}).sort({updatedAt: 1});

        /**If no rides are found  */
        if (rides.length == 0) {
            return // console.log("No driver in assigning state");
        }        

        /**Update each and every driver and ride corresponding to it */
        for await (const ride of rides) {
            let driver = await Driver.findOne({_id: new ObjectId(ride.rideDriverId)});
            if (driver) {
                await freeDriver(driver,ride);
            }
        }
    } catch (error) {
        console.log(error);
    }
}

/**Free Driver */
async function freeDriver(driver,ride) {
   try {
        async function checkCondition() {
            if ((Math.floor((new Date() - driver.updatedAt)/1000)) >= timeToAcceptRequest) {
                driver.driverRideStatus = 0;
                await driver.save();
                ride.rideNoActionByDriverId.push(driver._id);
                if (ride.rideDriverAssignType == 1) {
                    ride.rideStatus = 1;
                } else {
                    ride.rideStatus = 2;
                }
                ride.rideDriverId = null;
                await ride.save();
                SocketIo.socketEmit('dataChange');
                await SocketIo.findDriver({ride: ride});
            } else {
                setImmediate(checkCondition);
            }
        }
        checkCondition();
   } catch (error) {
        console.log(error);
   }
}

/**Assign new driver */
async function assignNewDriver() {
    const rides = await Ride.find({"rideStatus": 2});
    if (rides.length == 0) {
        return //console.log("No ride with random driver assign");
    }

    for await(const ride of rides) {
        await SocketIo.findDriver({ride: ride});
    }
}

module.exports = {
    getSettingData: getSettingData,
};
