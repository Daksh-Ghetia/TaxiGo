const express = require('express');
const router = new express.Router();
const Driver = require('../models/driver');
const Ride = require('../models/ride');
const { ObjectId } = require('mongodb');

const app = express();
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
                
                let currentlyTime = new Date().getSeconds();
                console.log("create", currentlyTime);
                
                if (driver.length <= 0 || ride.length <= 0) {
                    throw new Error('Error occured in socket while assigning selected driver');
                }
                socketEmit('dataChange');
            } catch (error) {
                console.log(error);
            }
        });

        socket.on('assignRandomDriver', async (data) => {
            try {
                const updateRide = await Ride.findByIdAndUpdate(data.ride._id, {rideStatus: 1, rideNoActionByDriverId: [], rideDriverAssignType: data.rideDriverAssignType}, {new: true, runValidators: true});

                if (updateRide.length == 0) {
                    return console.log("Error occured while updating ride with random driver selection");
                }

                let pipeline = [
                    {
                        $match: {
                            _id: new ObjectId(data.ride._id)
                        }
                    },
                    {
                        $lookup: {
                            from: 'drivers',
                            as: 'driver',
                            localField: 'rideServiceTypeId',
                            foreignField: 'driverServiceTypeId'
                        }
                    },
                    {
                        $match: {
                            $and: [
                                { "driver.driverStatus": true },
                                { "driver.driverRideStatus": 0}
                            ]
                        }
                    },
                    {
                        $addFields: {
                            driver: {
                                $filter: {
                                    input: "$driver",
                                    as: "driverInfo",
                                    cond: {
                                        $eq: ["$$driverInfo.driverCityId", "$rideCityId"]
                                    }
                                }
                            }
                        }
                    },
                    {
                        $addFields:{
                            driver: {
                                $setDifference: ["$driver._id", "$rideRejectedByDriverId"]
                            }
                        }
                    },
                    {
                        $addFields:{
                            driver: {
                                $setDifference: ["$driver", "$rideNoActionByDriverId"]
                            }
                        }
                    }
                ];
                const rides = await Ride.aggregate(pipeline);
                socketEmit('watchData', rides);

                rides.forEach( async (ride) => {
                    if (ride.driver.length == 0) {
                        return;
                    }

                    console.log(ride.driver[0]._id);

                    const driver = await Driver.findByIdAndUpdate(ride.driver[0]._id, { driverRideStatus: 1}, { new: true, runValidators: true });
                    const rideUpdate = await Ride.findByIdAndUpdate(ride._id, {rideStatus : 2, rideDriverId: ride.driver[0]._id, rideDriverAssignType: data.rideDriverAssignType}, { new: true, runValidators: true });

                    if (driver.length <= 0 || rideUpdate.length <= 0) {
                        throw new Error('Error occured in socket while assigning random driver');
                    }
                });                
                socketEmit('dataChange');
            } catch (error) {
                console.log(error);
            }
        })

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

        socket.on('driverRejectRequestNearest', async (data) => {
            try {
                const driver = await Driver.findByIdAndUpdate(data.driver._id, {driverRideStatus: 0}, {new: true, runValidators: true});
                const ride = await Ride.findByIdAndUpdate(
                    data.ride._id, 
                    {
                        rideStatus: 1,
                        $push: { rideRejectedByDriverId: new ObjectId(data.driver._id)}
                    }, 
                    {new: true, runValidators: true});
            } catch (error) {
                
            }
        })
    })
}

function socketEmit(eventName, data="") {
    io.emit(eventName, data);
}

module.exports = {
    socket: socket,
    socketEmit: socketEmit
};