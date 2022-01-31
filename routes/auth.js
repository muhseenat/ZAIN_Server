const express = require ('express');
const authControllers = require('../controllers/auth')
const router = express.Router();



router.post('/register',authControllers.registerUser);

router.post('/login',authControllers.loginUser);

router.post('/otpSend',authControllers.otpSend);

router.post('/otpVerify',authControllers.otpVerify);





module.exports= router;