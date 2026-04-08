const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');
const mapService = require('../services/maps.service');
const { sendMessageToSocketId } = require('../socket');
const rideModel = require('../models/ride.model');
const captainModel = require('../models/captain.model');

require('../models/user.models');


// 🚀 CREATE RIDE
module.exports.createRide = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, vehicleType } = req.body;

    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized. User data is missing.' });
        }

        // ✅ Create ride
        const ride = await rideService.createRide({
            user: req.user._id,
            pickup,
            destination,
            vehicleType
        });

        res.status(201).json(ride);

        // 🔥 Run async (don’t block response)
        process.nextTick(async () => {
            try {

                // 📍 Get pickup coordinates
                const pickupCoordinates = await mapService.getAddressCoordinate(pickup);

                console.log("📍 Pickup Coordinates:", pickupCoordinates);

                // 🚨 Try geo filter (may fail)
                let captainsInRadius = [];

                try {
                    captainsInRadius = await mapService.getCaptainsInTheRadius(
                        pickupCoordinates.lat,
                        pickupCoordinates.lng,
                        2
                    );

                    console.log(`✅ Found ${captainsInRadius.length} captains in radius`);

                } catch (geoError) {
                    console.log("❌ Geo query failed:", geoError.message);
                }

                // 🧠 Populate ride with user
                const rideWithUser = await rideModel.findById(ride._id).populate('user').select('+otp');

                // 🚨 FALLBACK: if no captains → send to ALL
                if (!captainsInRadius || captainsInRadius.length === 0) {

                    console.log("🔥 No captains in radius → sending to ALL captains");

                    const allCaptains = await captainModel.find();

                    allCaptains.forEach(captain => {
                        if (captain.socketId) {
                            console.log(`📡 Sending to captain ${captain._id}`);

                            sendMessageToSocketId(captain.socketId, {
                                event: 'new-ride',
                                data: rideWithUser
                            });
                        }
                    });

                    return;
                }

                // ✅ NORMAL FLOW (if captains found)
                captainsInRadius.forEach(captain => {
                    if (captain.socketId) {

                        console.log(`📡 Notifying captain ${captain._id}`);

                        sendMessageToSocketId(captain.socketId, {
                            event: 'new-ride',
                            data: rideWithUser
                        });

                    } else {
                        console.log(`⚠️ Captain ${captain._id} has no socketId`);
                    }
                });

            } catch (err) {
                console.error('❌ Failed to notify captains:', err.message);
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
};



// 💰 GET FARE
module.exports.getFare = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination } = req.query;

    try {
        const fare = await rideService.getFare(pickup, destination);
        return res.status(200).json(fare);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};



// ✅ CONFIRM RIDE
module.exports.confirmRide = async (req, res) => {

    const { rideId } = req.body;

    try {
        const ride = await rideService.confirmRide({
            rideId,
            captain: req.captain
        });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-confirmed',
            data: ride
        });

        return res.status(200).json(ride);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
};



// 🚗 START RIDE
module.exports.startRide = async (req, res) => {

    const { rideId, otp } = req.query;

    try {
        const ride = await rideService.startRide({
            rideId,
            otp,
            captain: req.captain
        });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-started',
            data: ride
        });

        return res.status(200).json(ride);

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};



// 🏁 END RIDE
module.exports.endRide = async (req, res) => {

    const { rideId } = req.body;

    try {
        const ride = await rideService.endRide({
            rideId,
            captain: req.captain
        });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-ended',
            data: ride
        });

        return res.status(200).json(ride);

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};