const express = require('express');
const router = express.Router();
const orderControllers = require('../controllers/order');


router.post('/create',orderControllers.addAddress);
router.get('/getaddress/:id',orderControllers.getAddress);
router.get('/getorders',orderControllers.getOrders);
router.put('/changestatus',orderControllers.changeStatus);
router.post('/verifypayment',orderControllers.verifyPayment);
router.get('/order-history/:id',orderControllers.orderHistory);
module.exports=router