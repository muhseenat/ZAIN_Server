const User = require("../models/User");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const mongoose = require("mongoose");

const objectId = mongoose.Types.ObjectId;

const addAddress = async (req, res) => {
  console.log(req.body);
  const { userId, currentAddresses, showSave, method } = req.body;
  if (showSave) {
    await User.updateOne(
      { _id: userId },
      {
        $push: {
          address: currentAddresses,
        },
      }
    );
  }
  Cart.aggregate([
    {
      $match: { userId: userId },
    },
    {
      $unwind: "$products",
    },
    {
      $project: {
        id: "$products.item",
        quantity: "$products.quantity",
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "id",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $project: {
        id: 1,
        quantity: 1,
        product: { $arrayElemAt: ["$product", 0] },
      },
    },
  ]).then((resp) => {
   
    let product = [];

    resp.map((resp) => {
      product.push({
        id: resp.id,
        quantity: resp.quantity,
        product: resp.product.name,
        price: resp.product.price * resp.quantity,
        status: "placed",
        image: resp.product.img1[0].url,
      });
    });

    const order = new Order({
      userId: userId,
    
      address: currentAddresses,
      products: product,
      method: method,
    });
    order.save().then((resp) => {
      console.log('order collection');
      console.log(resp);
      res.status(200).json({ resp });
    }).catch((err)=>{
      res.status(400).json({err});
    })

   
  }).catch((err)=>{
    res.status(400).json({err});
  })
};

const getAddress = (req, res) => {
  const userId = req.params.id;
  console.log(userId);
  User.aggregate([
    {
      $match: {
        _id: objectId(userId),
      },
    },
    {
      $project: {
        _id: 0,
        address: 1,
      },
    },
  ])
    .then((adr) => {
      console.log(adr);
      res.status(200).json({ adr });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};

module.exports = { addAddress, getAddress };
