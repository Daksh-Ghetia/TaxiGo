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
    
        socket.on('assignSelectedDriver', async (data) => {
            const driver = await Driver.findByIdAndUpdate(data.driver._id, {driverRideStatus: 1}, { new: true, runValidators: true });
            const ride = await Ride.findByIdAndUpdate(
                data.ride._id, 
                {
                    rideStatus : 2, 
                    rideDriverId: data.driver._id,
                    rideDriverAssignType: data.rideDriverAssignType
                }, { 
                    new: true,
                    runValidators: true 
                });
        })
    })
}

module.exports = socket;