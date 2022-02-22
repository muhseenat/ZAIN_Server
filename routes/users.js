var express = require('express');
var router = express.Router();
const userControllers = require('../controllers/user')



router.get('/getusers',userControllers.getUser)
router.put('/edituser/:id',userControllers.updateUser)
// router.get('/searchusers/:search',userControllers.searchUser)
router.delete('/deleteusers/:id',userControllers.deleteUser)
router.get('/getuser/:id',userControllers.getSpecificUser)
router.put('/block/:id',userControllers.blockUser);
router.put('/update-address',userControllers.updateAddress)
router.put('/add-address',userControllers.addAddress)
router.get('/get-latest-users',userControllers.latestMembers)
router.get('/get-user-statics',userControllers.userStatics)
module.exports = router;
