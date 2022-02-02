var express = require('express');
var router = express.Router();
const userControllers = require('../controllers/user')


router.get('/getusers',userControllers.getUser)
router.put('/edituser/:id',userControllers.updateUser)
router.get('/searchusers/:search',userControllers.searchUser)
router.delete('/deleteusers/:id',userControllers.deleteUser)
router.get('/getuser',userControllers.getSpecificUser)
router.put('/block/:id',userControllers.blockUser);

module.exports = router;
