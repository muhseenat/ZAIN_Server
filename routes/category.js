const express = require ('express');
const categoryControllers = require('../controllers/category');
const router = express.Router();





router.post('/createCategory',categoryControllers.createCategory);
router.get('/getcategory',categoryControllers.getCategory);
router.delete('/deleteCategory/:id/:sub',categoryControllers.deleteCategory);
router.get('/getSubCategory', categoryControllers.getSubCategory);




module.exports= router;