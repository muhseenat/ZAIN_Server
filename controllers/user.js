const User = require("../models/User");

const getUser = (req, res) => {
  User.find({})
    .then((users) => {
      res.status(200).json({ users });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};

const getSpecificUser = (req, res) => {
  User.findOne({ _id: req.params.id })
    .then((resp) => {
      res.status(200).json({ resp });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};

const deleteUser = (req, res) => {
  User.deleteOne({ _id: req.params.id })
    .then((resp) => {
      res.status(200).json({ resp });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};

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

module.exports = {
  getUser,
  searchUser,
  getSpecificUser,
  deleteUser,
  updateUser,
  blockUser,
};