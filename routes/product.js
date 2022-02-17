const express = require ('express');
const router = express.Router();
const productControllers = require('../controllers/product')
const upload = require ("../config/multer");





// router.post('/addProduct',productControllers.addProduct);
router.post('/addProduct',upload.array('img'),productControllers.addProduct);
router.get('/getproduct',productControllers.getProduct);
router.delete('/deleteproduct/:id',productControllers.deleteProduct);
// router.put('/updateproduct/:id',upload.array('img'),productControllers.updateProduct);
router.get('/getproductbyid/:id',productControllers.getProductById);
router.post('/offer/coupon',productControllers.createCoupon);






module.exports= router;