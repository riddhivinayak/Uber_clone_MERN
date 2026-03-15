const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const userContoller = require('../controllers/user.controller');
const authMiddleware = require('../middlewears/auth.middleware');

router.post('/register', [
    body('email').isEmail().withMessage('Please enter a valid email address'),

    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

    body('fullName.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),

    body('fullName.lastname').isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long')
    ], userContoller.registerUser)

  router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('password').not().isEmpty().withMessage('Password is required')
  ], userContoller.loginUser)

  router.get('/profile', authMiddleware.authenticateToken, userContoller.getUserProfile)

  router.get('/logout', authMiddleware.authenticateToken, userContoller.logoutUser)











    module.exports = router;