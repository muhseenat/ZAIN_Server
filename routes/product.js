const express = require ('express');
const router = express.Router();
const productControllers = require('../controllers/product')
const upload = require ("../config/multer");






router.post('/addProduct',upload.array('img'),productControllers.addProduct);
router.get('/getproduct',productControllers.getProduct);
router.delete('/deleteproduct/:id',productControllers.deleteProduct);
// router.put('/updateproduct/:id',upload.array('img'),productControllers.updateProduct);
router.get('/getproductbyid/:id',productControllers.getProductById);
router.post('/offer/coupon',productControllers.createCoupon);
router.get('/get-products',productControllers.getProductsName)
router.put('/product-offer',productControllers.productOffer)
router.put('/category-offer',productControllers.categoryOffer)
router.get('/getproduct/:id',productControllers.getProductId)





module.exports= router;