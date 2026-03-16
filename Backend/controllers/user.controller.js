const userModel = require('../models/user.models');
const userService = require('../services/user.service');
const { validationResult } = require('express-validator');
const blacklistTokenModel = require('../models/blacklistToken.model');

module.exports.registerUser = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {fullName, email, password } = req.body;
      const isUserAlreadyExist = await userModel.findOne({email});
       if(isUserAlreadyExist)
      {
            return res.status(400).json    ({message: 'User with this email already exists'});
      }
      
    const hashedPassword = await userModel.hashPassword(password);

    const user = await userService.createUser({
        firstname: fullName.firstname,
        lastname: fullName.lastname,
        email,
        password: hashedPassword
    });

    const token = user.generateAuthToken();

    res.status(201).json({
        message: 'User registered successfully',
        user,
        token
    });

};

module.exports.loginUser = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select('+password');//We have will select the password field because we have set select: false in the user model thats why we need to explicitly select it here by using +password

    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
   
    const isMatch = await user.comparePasswords(password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = user.generateAuthToken();
     
    res.cookie('token', token, )
        

    res.status(200).json({
        message: 'Login successful',
        user,
        token
    });
}

module.exports.getUserProfile = async (req, res) => {
   res.status(200).json(req.user)
}

module.exports.logoutUser = async (req, res) => {
    res.clearCookie('token');
    const token = req.cookies.token || req.headers.authorization.split(' ')[1];

    await blacklistTokenModel.create({ token });
    res.status(200).json({ message: 'Logout successful' });
}