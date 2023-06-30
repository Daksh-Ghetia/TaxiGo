const express = require('express');
const router = new express.Router();
const Driver = require('../models/driver');
const Ride = require('../models/ride');
const { ObjectId } = require('mongodb');
const SendMessage = require('./SMS');

const app = express();
let io;

function socket(server) {
    io = require('socket.io')(server, {cors: {origin: "*"}});

    io.on('connection', function (socket) {
    
        /**Assign selected driver event */
        socket.on('assignSelectedDriver', async (data) => {
            try {
                /**Update driver status as waiting for driver to accept or reject request */
                const driver = await Driver.findByIdAndUpdate(data.driver._id, { driverRideStatus: 1}, { new: true, runValidators: true });
                
                /**Update ride status as assigned to a driver and waiting for driver response */
                const ride = await Ride.findByIdAndUpdate(data.ride._id, {
                    rideStatus : 3,
                    rideDriverId: data.driver._id,
                    rideDriverAssignType: data.rideDriverAssignType
                }, { new: true, runValidators: true });
                                
                if (driver.length <= 0 || ride.length <= 0) {
                    throw new Error('Error occured in socket while assigning selected driver');
                }
                socketEmit('dataChange');
                socketEmit('driverAssigned');
            } catch (error) {
                console.log(error);
            }
        });

        socket.on('assignRandomDriver', async (data) => {
            try {
                const updateRide = await Ride.findByIdAndUpdate(data.ride._id, {
                    rideNoActionByDriverId: [],
                    rideRejectedByDriverId: [],
                    rideDriverAssignType: data.rideDriverAssignType
                }, {new: true, runValidators: true});

                if (updateRide.length == 0) {
                    return console.log("Error occured while updating ride with random driver selection");
                }

                await findDriver(data);
                socketEmit('dataChange');
                socketEmit('driverAssigned');
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
                const ride = await Ride.findByIdAndUpdate(data.ride._id, {rideStatus: 4}, {new: true, runValidators: true});
                SMSBody = "Ride Confirmed, Congratulations " + driver.driverName + " you have been assigned to a new ride, and your customer pickup location is " +  ride.ridePickUpLocation + " And customer should be dropped at " + ride.rideDropLocation;
                socketEmit('dataChange');
                socketEmit('driverAcceptRequest');
                await SendMessage.SendMessage(SMSBody);
            } catch (error) {
                socketEmit('errorOccured', error.message);
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
                        rideStatus: 2,
                        $push: { rideRejectedByDriverId: new ObjectId(data.driver._id)}
                    }, 
                    {new: true, runValidators: true}
                );
                
                if (driver.length == 0 || ride.length == 0) {
                    return console.log("No driver or ride to update after rejection");
                }

                const rides = await findDriver(data);
                socketEmit('dataChange', rides);
            } catch (error) {
                console.log(error);
            }
        })
    })
}

function socketEmit(eventName, data="") {
    io.emit(eventName, data);
}

async function findDriver(data) {
    try {
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
                $addFields: {
                    driver: {
                        $filter: {
                            input: "$driver",
                            as: "driverInfoCheck",
                            cond: {
                                
                                $and: [
                                    {$eq: ["$$driverInfoCheck.driverStatus", true]},
                                    {$eq: ["$$driverInfoCheck.driverRideStatus", 0]},
                                    {$eq: ["$$driverInfoCheck.driverCityId", "$rideCityId"]}
                                ]                                
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

        await rides.forEach( async (ride) => {
            if (ride.driver.length == 0) {
                return;
            }

            for await (const driverList of ride.driver) {
                const driverData = await Driver.findOne({_id: new ObjectId(driverList)});
                if (driverData && driverData.driverRideStatus == 0) {
                    await Driver.findByIdAndUpdate(driverList, { driverRideStatus: 1}, { new: true, runValidators: true });
                    await Ride.findByIdAndUpdate(ride._id, {
                        rideStatus : 3,
                        rideDriverId: driverList,
                        rideDriverAssignType: data.rideDriverAssignType
                    }, { new: true, runValidators: true });
                    break;
                }
            }
        });

        return rides;
    } catch (error) {
        console.log("Error while finding driver function", error);
    }    
}

module.exports = {
    socket: socket,
    socketEmit: socketEmit,
    findDriver: findDriver,
};