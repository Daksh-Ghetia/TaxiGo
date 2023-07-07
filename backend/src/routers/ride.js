const express = require('express');
const auth = require('../middleware/authentication');
const multer = require('multer');
const Ride = require('../models/ride');
const Driver = require('../models/driver');
const User = require('../models/user');
const SendMessage = require('./SMS');
const paymentGateway = require('./paymentGateway');
const VehicleType = require('../models/vehicleType');
const mongoose = require('mongoose');
const mail = require('./mail');

const router = new express.Router();

const upload = multer();

/**Get ride data */
router.post('/ride/getRideDetails', auth, upload.none(),async (req, res) => {
    try {
        let rideStatusMatchQuery;
        let rideFilterQuery;
        let ridePaginationQueryFacet,ridePaginationQueryTotalCountUnwind,ridePaginationQueryProjectTotalCount;

        if (req.body.rideStatus && Array.isArray(req.body.rideStatus)) {
            rideStatusMatchQuery = {
                $match: {
                    rideStatus: { $in: req.body.rideStatus}
                }
            }
        }

        let lookupPipeline = [
            {
                $lookup: {
                    from: 'users',
                    as: 'user',
                    localField: 'rideCustomerId',
                    foreignField: '_id'
                }
            },
            {
                $lookup: {
                    from: 'countries',
                    as: 'country',
                    localField: 'user.userCountryId',
                    foreignField: '_id'
                }
            },
            {
                $lookup: {
                    from: 'vehicletypes',
                    as: 'vehicleType',
                    localField: 'rideServiceTypeId',
                    foreignField: '_id'
                }
            },
            {
                $lookup: {
                    from: 'drivers',
                    as: 'driver',
                    localField: 'rideDriverId',
                    foreignField: '_id'
                }
            },
            {
                $unwind: "$user"
            },
            {
                $unwind: '$vehicleType'
            }
        ]

        if (req.body.rideFilter) {
            let { rideSearchData, rideStatus, rideVehicleType, rideFromDate, rideToDate } = req.body.rideFilter;
            let filterConditions = [];
            
            if (rideSearchData && rideSearchData !== "null") {
                if (mongoose.Types.ObjectId.isValid(rideSearchData)) {
                    filterConditions.push({
                        _id: new mongoose.Types.ObjectId(rideSearchData),
                    })
                } else {
                    rideSearchData = rideSearchData.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
                    rideSearchData = new RegExp(rideSearchData, "i");
                    filterConditions.push({
                        $or: [
                            {"user.userName": rideSearchData},
                            {"user.userPhone": rideSearchData},
                            {"ridePickUpLocation": rideSearchData},
                            {"rideDropLocation": rideSearchData}
                        ]
                    })
                }
            }

            if (rideStatus && rideStatus !== "null") {
                filterConditions.push({rideStatus: +rideStatus})
            }

            if (rideVehicleType && mongoose.Types.ObjectId.isValid(rideVehicleType)) {
                filterConditions.push({rideServiceTypeId: new mongoose.Types.ObjectId(rideVehicleType)});
            }

            if (rideFromDate != "null") {
                filterConditions.push({ rideDateTime: { $gte: new Date(rideFromDate)}});
            }

            if (rideToDate != "null") {
                filterConditions.push({ rideDateTime: { $lte: new Date(rideToDate)}});
            }

            if (filterConditions.length > 0) {
                rideFilterQuery = {
                    $and: filterConditions,
                };
            }
        }

        if (req.body.pageNumber !== null) {
            ridePaginationQueryFacet = {
                $facet: {
                    totalCount: [
                        {
                            $group: {
                                _id: null,
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                count: 1
                            }
                        }
                    ],
                    paginatedData: [
                        { $skip: req.body.pageNumber * 10 },
                        { $limit: 10 }
                    ]
                }
            }
            ridePaginationQueryTotalCountUnwind = {
                $unwind: '$totalCount'
            }
            ridePaginationQueryProjectTotalCount = {
                $project: {
                    totalCount: '$totalCount.count',
                    paginatedData: 1
                }
            }
        }

        let pipeline = [
            ...(rideStatusMatchQuery ? [rideStatusMatchQuery] : []),
            ...lookupPipeline,
            ...(rideFilterQuery ? [{ $match: rideFilterQuery}] : []),
            ...(ridePaginationQueryFacet ? [ridePaginationQueryFacet] : []),
            ...(ridePaginationQueryTotalCountUnwind ? [ridePaginationQueryTotalCountUnwind] : []),
            ...(ridePaginationQueryProjectTotalCount ? [ridePaginationQueryProjectTotalCount] : [])
        ]

        /**Find all the ride data and if not found return no data to display*/
        let ride = await Ride.aggregate(pipeline);
        if (ride.length == 0) {
            return res.status(200).send({msg: "No ride to display", ride: [], status: "failed"});
        }

        /**If data found send the data */
        if (req.body.pageNumber !== null) {
            return res.status(200).send({ride: ride[0].paginatedData, totalRecord: ride[0].totalCount, msg: 'ride found', status: "success"})
        } else {
            return res.status(200).send({ride: ride, msg: 'ride found', status: "success"})
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({msg: "Error occured while getting data of ride", status: "failed", error: error});
    }
})

/**Add new ride */
router.post('/ride/addRide', auth, upload.none(), async (req,res) => {
    try {
        /**Create a new instance of type ride and save it to database*/
        const ride = new Ride({
            ...req.body,
        })

        if (!ride) {
            return res.status(404).send({msg: "No data found while adding ride", status: "failed"})
        }
        await ride.save()

        /**Revert back to the admin stating ride added successfully */
        return res.status(200).send({ride: ride, msg: "Ride added successfully", status: "success"});
    } catch (error) {
        res.status(500).send({msg: "Server error while adding ride", status: "failed", error: error});
    }
})

/**Update the Ride */
router.patch('/ride/editRide/:id', auth, upload.none(), async(req,res) => {
    try {
        /**Parse the body and store the keys of sent data */
        let updates = Object.keys(req.body);
        const allowedUpdates = ["rideStatus", "rideDriverId", "rideRejectedByDriverId", "rideNoActionByDriverId", "rideDriverAssignType"];

        /**Check if the updates are applied for permissible  type only and if other update found return invalid updates*/
        const isValidOpertaion = updates.every((update) => allowedUpdates.includes(update));
        if (!isValidOpertaion) {
            return res.status(400).send({msg: "Invalid updates while updating ride", status: "failed"})
        }

        /**find the ride to update and if not found return ride not found*/
        const ride = await Ride.findOne({_id: req.params.id});
        if (!ride) {
            return res.status(404).send({msg: "Ride not found for update", status: "failed"})
        }

        /**Apply updates to the field */
        updates.forEach((update) => ride[update] = req.body[update])
        await ride.save();
        /**Free driver whenever the ride is completed and if the ride is started then send message of ride started */
        if (req.body.rideStatus == 7) {
            /**Update Driver data and get user, vehicle type data to send message and mail  */
            const driver = await Driver.findByIdAndUpdate(ride.rideDriverId, {driverRideStatus: 0}, {new: true, runValidators: true});
            const user = await User.findOne({_id: ride.rideCustomerId});
            const vehicleType = await VehicleType.findOne({_id: ride.rideServiceTypeId})

            /**Deduct payment if payment method is card and after that save the ride info*/
            if (ride.ridePaymentMethod == 1) {
                await paymentGateway.deductPayment(user.userPaymentCustomerId, ride.ridePaymentCardId, ride.rideFare);
            }
            
            /**Get mail body */
            let msg = await getMailBody(ride, user, driver, vehicleType);
            if (ride.ridePaymentMethod == 0) {
                msg+= `<tr>
                        <td class="label-input">Payment method: </td>
                        <td>Cash</td>
                    </tr>
                </tbody>
                </table>`
            } else {
                msg += `
                    <tr>
                        <td class="label-input">Payment method: </td>
                        <td>Card</td>
                    </tr>
                    <tr>
                        <td class="label-input">Payment Card Id: </td>
                        <td>${ride.ridePaymentCardId} </td>
                    </tr>
                    </tbody>
                </table>
                `
            }

            /**Send mail and message */
            await mail.sendMail(user.userEmail, "Ride receipt", null ,msg);
            await SendMessage.SendMessage("Ride has been completed");
        } else if (req.body.rideStatus == 6) {
            await SendMessage.SendMessage("Ride has been started");
        }
        res.status(200).send({msg: "Edit success", ride: ride, status: "success"});
    } catch (error) {
        res.status(500).send({msg: "Server error while adding ride", status: "failed", error: error});
    }
})

async function getMailBody(ride, user, driver, vehicleType) {
    return `Congratulations <h5>${user.userName} </h5>, your ride has been completed successfully. 
            <br>
            <H2>Ride summary</H2>

            <table>
                <tbody>
                    <tr>
                        <td class="label-input">Ride id: </td>
                        <td>${ride._id}</td>
                    </tr>
                    <tr>
                        <td class="label-input">User id: </td>
                        <td>${ride.rideCustomerId}</td>
                    </tr>
                    <tr>
                        <td class="label-input">User contact no: </td>
                        <td>${user.userPhone}</td>
                    </tr>
                    <tr>
                        <td class="label-input">User email: </td>
                        <td>${user.userEmail} </td>
                    </tr>
                    <tr>
                        <td class="label-input">Vehicle type: </td>
                        <td>${vehicleType.vehicleName} </td>
                    </tr>
                    <tr>
                        <td class="label-input">Driver Name: </td>
                        <td>${driver.driverName} </td>
                    </tr>
                    <tr>
                        <td class="label-input">Pick point: </td>
                        <td><li>${ride.ridePickUpLocation}</li> </td>
                    </tr>
                    <tr>
                        <td class="label-input">Drop point: </td>
                        <td><li>${ride.rideDropLocation}</li> </td>
                    </tr>
                    <tr>
                        <td class="label-input">Ride Date and Time: </td>
                        <td>${new Date(ride.rideDateTime)}</td>
                    </tr>
                    <tr>
                        <td class="label-input">Ride Distance: </td>
                        <td>${ride.rideDistance} Km </td>
                    </tr>
                    <tr>
                        <td class="label-input">Total travel time: </td>
                        <td>${ride.rideTime} minutes</td>
                    </tr>
                    <tr>
                        <td class="label-input">Estimated Fare: </td>
                        <td>$ ${ride.rideFare} </td>
                    </tr>
                    `
}

module.exports = router