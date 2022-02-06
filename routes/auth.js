const express = require ('express');
const authControllers = require('../controllers/auth')
const router = express.Router();



router.post('/register',authControllers.registerUser);

router.post('/login',authControllers.loginUser);

router.post('/otpsend',authControllers.otpSend);


router.post('/otpverify',authControllers.otpVerify)
 
router.post('/admin/login',authControllers.adminLogin);




module.exports= router;