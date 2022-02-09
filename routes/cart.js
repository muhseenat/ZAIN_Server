const express = require ('express');
const router = express.Router();
const cartControllers = require('../controllers/cart');


 router.post('/add',cartControllers.addToCart);
 router.get('/getcart/:id',cartControllers.getCartItems);


module.exports= router;