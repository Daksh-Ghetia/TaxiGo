const express = require('express');
const cron = require('node-cron');
const Setting = require('../models/setting');
const SocketIo = require('./socket-io');
const Driver = require('../models/driver');
const Ride = require('../models/ride');
const { ObjectId } = require('mongodb');

let timeToAcceptRequest;

cron.schedule('*/10 * * * * *', function () {
    // let currenttSecond = new Date().getSeconds();
    // console.log(currenttSecond);
    getDriverData();
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
        // let drivers = await Driver.find({"driverRideStatus": 1}).sort({updatedAt: 1});
        let rides = await Ride.find({"rideStatus": 2}).sort({updatedAt: 1});
        
        // /**If no drivers are having  */
        // if (drivers.length == 0) {
        //     return
        //     // return console.log("No driver in assigning state");
        // }
        /**If no rides are found  */
        if (rides.length == 0) {
            return
            // return console.log("No driver in assigning state");
        }        

        /**Update each and every driver and ride corresponding to it */
        // drivers.forEach(async (driver) => {
        //     freeDriver(driver);
        // });

        rides.forEach(async (ride) => {
            
            let driver = await Driver.findOne({_id: new ObjectId(ride.rideDriverId)});
            await freeDriver(driver,ride);

            // if (driver._id == "64673ef3cf6558e6cb70bffc" && ride._id == "6466037fe7c5f27b1bc22692") {
            //     console.log(driver,ride);
            //} 
        });
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
                // let ride = await Ride.findOne({rideDriverId: driver._id});
                // if (ride) {
                ride.rideNoActionByDriverId.push(driver._id);
                ride.rideStatus = 1;
                ride.rideDriverId = null;
                await ride.save();
                await assignNewDriver();
                SocketIo.socketEmit('dataChange');
                // }
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
    const rides = await Ride.find({rideStatus: 1, rideDriverAssignType: 2});
    if (rides.length == 0) {
        return console.log("No ride with random driver assign");
    }

    await rides.forEach( async (ride) => {
        console.log("Before");
        const data = await SocketIo.findDriver({ride: ride});
        SocketIo.socketEmit('dataChange');

        if (data[0]._id == "6464978690c2a508542b7b48" || data[0]._id == "6466037fe7c5f27b1bc22692") {
            console.log("After" , data[0]);
        }
    });
}

module.exports = {
    getSettingData: getSettingData,
};
