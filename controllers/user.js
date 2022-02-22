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

//GET LATEST USERS
const latestMembers = (req, res) => {
  User.find({})
    .sort({ createdAt: -1 })
    .limit(5)
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
      console.log();
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

// BLOCK USER API
const blockUser = async (req, res) => {
  console.log(req.params.id);
  let user = await User.findOne({ _id: req.params.id });

  User.updateOne(
    { _id: req.params.id },
    {
      $set: {
        status: !user.status,
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

//ADDRESS UPDATE API

const updateAddress = async (req, res) => {
  console.log(req.body);
  const { userId, currentAddresses } = req.body;

  User.updateOne(
    { _id: objectId(userId) ,
     "address._id": objectId(currentAddresses._id) },
    { $set: { "address.$": currentAddresses } }
  )
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });
};

//ADD ADDRESS API
const addAddress = async (req, res) => {
  console.log(req.body);
  const { userId, currentAddresses } = req.body;
  await User.updateOne(
    { _id: userId },
    {
      $push: {
        address: { ...currentAddresses, _id: objectId() },
      },
    }
  );
  User.findOne({ _id: userId }, { address: 1 })
    .then((adr) => {
      console.log(adr);
      res.status(200).json({ address: adr.address });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};
//USER STATICS API
const userStatics = (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
  console.log(date);
  console.log(lastYear);
  User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: lastYear,
        },
      },
    },
    {
      $project: {
        month: {
          $month: "$createdAt",
        },
      },
    },
    {
      $group: {
        _id: "$month",
        total: { $sum: 1 },
      },
    },
  ])
    .then((details) => {
      res.status(200).json({ details });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};

module.exports = {
  getUser,
  getSpecificUser,
  deleteUser,
  updateUser,
  blockUser,
  updateAddress,
  addAddress,
  latestMembers,
  userStatics,
};
