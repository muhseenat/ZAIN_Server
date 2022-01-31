const express = require ('express');
const router = express.Router();
const productControllers = require('../controllers/product')
const upload = require ("../config/multer");





// router.post('/addProduct',productControllers.addProduct);
router.post('/addProduct',upload.array('img'),productControllers.addProduct);

router.get('/getProduct',productControllers.getProduct);
router.delete('/deleteProduct',productControllers.deleteProduct);
router.put('/updateProduct',productControllers.updateProduct);
router.get('/getProductbyid/:id',productControllers.getProductById);






module.exports= router;