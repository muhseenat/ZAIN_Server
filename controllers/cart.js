const Cart = require("../models/Cart");

const mongoose = require("mongoose");

const objectId = mongoose.Types.ObjectId;


const addToCart = async (req, res) => {
  const { userId, proId } = req.body;
  let proObj = { item: objectId(proId), quantity: 1 };

  let userCart = await Cart.findOne({ userId: objectId(userId) });
  if (userCart) {
    let proExist = userCart.products.findIndex(
      (product) => product.item == proId
    );
 
    if (proExist != -1) {
      Cart.updateOne(
        {user:objectId(userId), "products.item": objectId(proId) },
        { $inc: { "products.$.quantity": 1 } }
      ).then((resp) => {
        res.status(200).json({ resp });
      });
    } else {
      Cart.updateOne(
        { userId: objectId(userId) },
        {
          $push: { products: proObj },
        }
      ).then((resp) => {
        res.status(200).json({ resp });
      });
    }
  } else {
    const item = new Cart({
      userId: objectId(userId),
      products: proObj,
    });
    item
      .save()
      .then((resp) => {
        res.status(200).json({ resp });
      })
      .catch((err) => {
        res.status(400).json({ err });
      });
  }
};

const getCartItems = (req, res) => {
  const userId = req.params.id;
  Cart.aggregate([
    {
      $match: { userId: userId },
    },
    {
      $unwind: "$products",
    },
    {
      $project: {
        item: "$products.item",
        quantity: "$products.quantity",
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "item",
        foreignField: "_id",
        as: "product",
      },
    },{
      $project:{
        item:1,
        quantity:1,
        product:{$arrayElemAt:['$product',0]}
      }
    }
  ])
    .then((resp) => {
    
      res.status(200).json({ resp });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};



const changeQuantity=async (req,res)=>{
   const {cartId,proId,count} = req.body

 
  await Cart.updateOne(
    {_id:objectId(cartId), "products.item": objectId(proId) },
    { $inc: { "products.$.quantity": count} }
  ).then((resp) => {
    res.status(200).json({ resp });
  }).catch((err)=>{
    console.log(err)
    res.status(400).json({err})
  })


}

const getCartCount=async(req,res)=>{
  const userId= req.params.id
  let count=0
  try {
    let cart=await Cart.findOne({userId:userId})
  if(cart){
    count=cart.products.length
  }
    res.status(200).json({count})
  } catch (error) {
    res.status(400).json({error})
  }
   
   
}

module.exports = { addToCart, getCartItems, changeQuantity,getCartCount };
