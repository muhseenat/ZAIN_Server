const express = require('express');
const router = express.Router();
const orderControllers = require('../controllers/order');


router.post('/create',orderControllers.addAddress);
router.get('/getaddress/:id',orderControllers.getAddress)

module.exports=router