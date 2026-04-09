// Authentication middleware for users and captains
const userModel = require('../models/user.models');
const jwt = require('jsonwebtoken');    
const bcrypt = require('bcrypt');
const blacklistTokenModel = require('../models/blacklistToken.model');
const captainModel = require('../models/captain.model');



module.exports.authenticateUserToken = async (req, res, next) => {
const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

if (!token) {
    return res.status(401).json({ message: 'Unauthorized. No token provided.' });
}

const isBlacklistedToken = await blacklistTokenModel.findOne({ token });

if (isBlacklistedToken) {
    return res.status(401).json({ message: 'Unauthorized. Token has been blacklisted.' });
}


try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded._id);// we only recive that data when decoded that was used at the time of tpoken genration like _id in this case

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized. User not found.' });
    }

    req.user = user;

    return next();
}
catch (err) {
return res.status(401).json({ message: 'Unauthorized. Invalid token.' });

}
}

module.exports.authcaptainToken   = async (req, res,next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

if (!token) {
    return res.status(401).json({ message: 'Unauthorized. No token provided.' });
}

const isBlacklistedToken = await blacklistTokenModel.findOne({ token });

if (isBlacklistedToken) {
    return res.status(401).json({ message: 'Unauthorized. Token has been blacklisted.' });
}


try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
       
    const captain = await captainModel.findById(decoded._id);// we only recive that data when decoded that was used at the time of tpoken genration like _id in this case

    if (!captain) {
        return res.status(401).json({ message: 'Unauthorized. Captain not found.' });
    }

    req.captain = captain;

    return next();
}
catch (err) {
return res.status(401).json({ message: 'Unauthorized. Invalid token.' });

}

}















//working  of .split(' ')

// 4. What .split(' ') does

// Example header:

// Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9

// Now .split(' ') separates by space.

// Result:

// ["Bearer", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"]

// Then:

// [1]

// selects the second element:

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9