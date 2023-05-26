const express = require('express');
const router = new express.Router();
const Driver = require('../models/driver');
const Ride = require('../models/ride');

const app = express();
var http = require('http').Server(app);

let io;

function socket(server) {
    io = require('socket.io')(server, {cors: {origin: "*"}});

    io.on('connection', function (socket) {
        // Code whenever the socket is closed
        // socket.on('disconnect', () => {
        //     console.log(`A user disconnected`);
        // })
    
        /**Assign selected driver event */
        socket.on('assignSelectedDriver', async (data) => {
            try {
                /**Update driver status as waiting for driver to accept or reject request */
                const driver = await Driver.findByIdAndUpdate(data.driver._id, { driverRideStatus: 1}, { new: true, runValidators: true });
                
                /**Update ride status as assigned to a driver and waiting for driver response */
                const ride = await Ride.findByIdAndUpdate(data.ride._id, {rideStatus : 2, rideDriverId: data.driver._id,rideDriverAssignType: data.rideDriverAssignType}, { new: true, runValidators: true });
                socketEmit('dataChange');

                let currentlyTime = new Date().getSeconds();
                console.log("create", currentlyTime);
                if (driver.length <= 0 || ride.length <= 0) {
                    throw new Error('Error occured in socket');
                }
            } catch (error) {
                console.log(error);
            }
        });

        /**Driver accept request */
        socket.on('driverAcceptReuest', async (data) => {
            try {
                /**Update driver status as waiting for driver to accept or reject request */
                const driver = await Driver.findByIdAndUpdate(data.driver._id, {driverRideStatus: 2}, {new: true, runValidators: true});

                /**Update ride status as assigned to a driver and waiting for driver response */
                const ride = await Ride.findByIdAndUpdate(data.ride._id, {rideStatus: 3}, {new: true, runValidators: true});
                socketEmit('dataChange');
            } catch (error) {
                console.log(error);
            }
        });

        /**Driver reject request of selected type */
        socket.on('driverRejectRequestSelected', async (data) => {
            try {
                const driver = await Driver.findByIdAndUpdate(data.driver._id, {driverRideStatus: 0}, {new: true, runValidators: true});
                const ride = await Ride.findByIdAndUpdate(data.ride._id, {rideStatus: 0}, {new: true, runValidators: true});
                socketEmit('dataChange');
            } catch (error) {
                console.log(error);
            }
        });
    })
}

function socketEmit(eventName, data="") {
    io.emit(eventName, data);
}

module.exports = {
    socket: socket,
    socketEmit: socketEmit
};