const User = require("../models/User");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const shortid = require('shortid')
const objectId = mongoose.Types.ObjectId;
const crypto = require('crypto');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
  

});

const addAddress = async (req, res) => {
  console.log(req.body);
  const { userId, currentAddresses, showSave, method,amount } = req.body;
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
  ])
    .then((resp) => {
      console.log(resp);
      let product = [];
      resp.forEach((resp) => {
        product.push({
          id: resp.id,
          quantity: resp.quantity,
          product: resp.product.name,
          price: resp.product.price * resp.quantity,
          status: "placed",
          image: resp.product.img1[0].url,
        });
      });

      const order =  new Order({
        userId: userId,
        address: currentAddresses,
        products: product,
        method: method,
        date:new Date()
      });
      order
        .save()
        .then((resp) => {
 console.log('new order'+ resp);
 const orderId=resp._id;
 console.log(orderId);
 console.log(userId);
       Cart.deleteOne({userId:objectId(userId)}).then((resp)=>{
        console.log('cart deleted');
        if(method=='COD'){
          res.status(200).json({ codSuccess:true });
        }else{
          console.log('method razorpay');
          
           console.log('method clling');
           const razorpayMethod=()=>{
             console.log('ullil keriiii');
             console.log(resp);
            const options ={
              amount:amount*100,
              currency:'INR',
               receipt:""+orderId, //shortid.generate(),//""+resp._id
              payment_capture:1
             }
          console.log(options);
         
         razorpay.orders.create(options).then((response)=>{
          console.log(response);
          res.status(200).json({
            id:response.id,
            currency:response.currency,
            amount:response.amount
          })
         }).catch((err)=>{
           console.log(err);
         })
            
          
          
        }
      
        razorpayMethod();
      }
      })
       }).catch((err)=>{
         console.log(err);
       })
   
         
        .catch((err) => {
          res.status(400).json({ err });
        });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};


// const razorpayMethod =async (req, res) => {
//   const payment_capture = 1;
//   const amount = 500//some usd value
//   const currency = 'INR'
//    const options ={
//     amount:(amount * 100),//usd to india conversion with strig
//     currency, 
//     receipt: shortid.generate(),
//     payment_capture
//    }

//    try {
//     const response = await razorpay.orders.create(options)
//     console.log(response);
//     res.status(200).json({
//       id:response.id,
//       currency:response.currency,
//       amount:response.amount
//     })
//    } catch (error) {
//       console.log(error);
//    }

  
//   }
 const verifyPayment=(req,res)=>{
   console.log(req.body);
 const { response,order}=req.body;
  console.log(response);
  console.log(order);
  const hmac = crypto.createHmac('sha256',process.env.RAZORPAY_SECRET_KEY)




 }

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

const getOrder = (req, res) => {
  Order.aggregate([
    {
      $unwind: "$products",
    },
  ])
    .then((resp) => {
      console.log(resp);
      res.status(200).json({ resp });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ err });
    });
};

const changeStatus = async (req, res) => {
  const { status, orderId, prodId } = req.body;
  console.log(req.body, prodId);

  await Order.updateOne(
    { _id: objectId(orderId), "products.id": objectId(prodId) },
    { $set: { "products.$.status": status } }
  )
    .then((resp) => {
      console.log(resp);
      res.status(200).json({ resp });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ err });
    });
};


module.exports = {
  addAddress,
  getAddress,
  getOrder,
  changeStatus,
  verifyPayment
};
