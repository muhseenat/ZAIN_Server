const express = require('express');
const router = express.Router();
const orderControllers = require('../controllers/order');


router.post('/create',orderControllers.addAddress);
router.get('/getaddress/:id',orderControllers.getAddress)
router.get('/getorders',orderControllers.getOrder);
router.put('/changestatus',orderControllers.changeStatus)
router.post('/razorpay',orderControllers.razorpayMethod)
module.exports=router