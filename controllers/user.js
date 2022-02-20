const { isValidObjectId } = require("mongoose");
const User = require("../models/User");
const mongoose = require("mongoose");

const objectId = mongoose.Types.ObjectId;
//GET USERS API
const getUser = (req, res) => {
  User.find({})
    .then((users) => {
      console.log(users);
      res.status(200).json({ users });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};

//GET SPECIFIC USER API
const getSpecificUser = (req, res) => {
  User.findOne({ _id: req.params.id })
    .then((resp) => {
      res.status(200).json({ resp });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};


//DELETE USER API
const deleteUser = (req, res) => {
  User.deleteOne({ _id: req.params.id })
    .then((resp) => {
      res.status(200).json({ resp });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};

//UPDATE USER API 
const updateUser = (req, res) => {
  User.updateOne(
    { _id: req.params.id },
    {
      $set: {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
      },
    }
  )
    .then((resp) => {
      res.status(200).json({ resp });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};


///serach params not working......

const searchUser = (req, res) => {
  const search = req.params.search;
  console.log(search);
  let keyword =
    search == "nofilter" ? {} : { name: { $regex: search, $option: "i" } };
  console.log(keyword);

  User.find(keyword)
    .then((resp) => {
      res.status(200).json({ resp });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};

// BLOCK USER API
const blockUser=async(req,res)=>{
console.log(req.params.id);
let user = await User.findOne({_id:req.params.id})

User.updateOne({_id:req.params.id},{$set:{
        status:!user.status
    }}).then((resp)=>{
        res.status(200).json({resp})
    }).catch((err)=>{
        res.status(400).json({err})
    })
}

// //ADD PROFILE PIC API
//  const addProfile = async(req,res)=>{
//      console.log(req.file);
//      console.log(req);

//    try {
     
//    } catch (error) {
     
//    }

//  }

//ADDRESS UPDATE API

const updateAddress=(req,res)=>{
  console.log(req.body);
  const {userId,currentAddresses} = req.body

  User.updateOne.aggregate([
    {
      $match:{
        _id: objectId(userId)
      },
       $umwind:"$address"
      },
      {
        $match:{
          _id:objectId(currentAddresses._id)
        }
      }
    
  ]).then((resp)=>{
    log(resp)
  }).catch((err)=>{
    console.log(err);
  })
}
//ADD ADDRESS API
const addAddress =async(req,res)=>{
  console.log(req.body);
  const {userId,currentAddresses} = req.body
   await User.updateOne(
    { _id: userId },
    {
      $push: {
        address: {...currentAddresses,_id:objectId()},
      },
    }
   )
User.findOne({_id:userId},{address:1}).then((adr)=>{
  console.log(adr);
  res.status(200).json({address:adr.address})

}).catch((err)=>{
  res.status(400).json({err})
})


}
module.exports = {
  getUser,
  searchUser,
  getSpecificUser,
  deleteUser,
  updateUser,
  blockUser,
  updateAddress,
  addAddress
};


// const addADdress =(req,res)=>{
//   User.updateOne({id:343434},{$set:{address:req.body}})
// }