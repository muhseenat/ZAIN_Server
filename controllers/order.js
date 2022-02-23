const User = require("../models/User");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const Cart = require("../models/Cart");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");

const objectId = mongoose.Types.ObjectId;
const crypto = require("crypto");
const { log } = require("console");


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});
// ORDER CREATE API
const addAddress = async (req, res) => {
  console.log(req.body);
  const { userId, currentAddresses, showSave, method, amount } = req.body;
  if (showSave) {
    await User.updateOne(
      { _id: userId },
      {
        $push: {
          address: { ...currentAddresses, _id: objectId() },
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
      let product = [];
      resp.forEach((resp) => {
        product.push({
          id: resp.id,
          quantity: resp.quantity,
          product: resp.product.name,
          price: resp.product.price * resp.quantity,
          status: "placed",
          delivered: null,
          shipped: null,
          image: resp.product.img1[0].url,
        });
      });

      const order = new Order({
        userId: userId,
        address: currentAddresses,
        products: product,
        method: method,

        date: new Date(),
      });
      order
        .save()
        .then((resp) => {
          const orderId = resp._id;

          Cart.deleteOne({ userId: objectId(userId) }).then((resp) => {
            if (method == "COD") {
              res.status(200).json({ codSuccess: true });
            } else if (method == "Paypal") {
              res.status(200).json({ paypalSuccess: true });
            } else {
              const razorpayMethod = () => {
                const options = {
                  amount: amount * 100,
                  currency: "INR",
                  receipt: "" + orderId,
                  payment_capture: 1,
                };

                razorpay.orders
                  .create(options)
                  .then((response) => {
                    res.status(200).json({
                      id: response.id,
                      currency: response.currency,
                      amount: response.amount,
                      receipt: "" + orderId,
                    });
                  })
                  .catch((err) => {
                    res.status(400).json({ err });
                  });
              };

              razorpayMethod();
            }
          });
        })
        .catch((err) => {
          res.status(400).json({ err });
        })

        .catch((err) => {
          res.status(400).json({ err });
        });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};
//RAZORPAY VERIFICATION API
const verifyPayment = (req, res) => {
  const { response, order } = req.body;

  let hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY);

  hmac.update(response.razorpay_order_id + "|" + response.razorpay_payment_id);

  hmac = hmac.digest("hex");

  if (hmac == response.razorpay_signature) {
    Order.updateOne(
      { _id: objectId(order.data.receipt) },
      {
        $set: {
          status: "placed",
        },
      }
    )
      .then((resp) => {
        res.status(200).json({ resp });
      })
      .catch((err) => {
        res.status(400).json({ err });
      });
  } else {
    res.status(401);
  }
};
//GET ADDRESS API
const getAddress = (req, res) => {
  const userId = req.params.id;

  User.findOne({ _id: objectId(userId) }, { address: 1 })
    .then((adr) => {
      res.status(200).json({ address: adr.address });
    })
    .catch((err) => {
      res.status(400);
    });
};
//GET ORDER API
const getOrders = (req, res) => {
  Order.aggregate([
    {
      $unwind: "$products",
    },
  ])
    .then((resp) => {
      res.status(200).json({ resp });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};
// STATUS CHANGE API
const changeStatus = async (req, res) => {
  const { status, orderId, prodId } = req.body;
  if (status === "shipped") {
    await Order.updateOne(
      { _id: objectId(orderId), "products.id": objectId(prodId) },
      {
        $set: { "products.$.status": status, "products.$.shipped": new Date() },
      }
    )
      .then((resp) => {
        res.status(200).json({ resp });
      })
      .catch((err) => {
        res.status(400).json({ err });
      });
  } else if (status === "delivered") {
    await Order.updateOne(
      { _id: objectId(orderId), "products.id": objectId(prodId) },
      {
        $set: {
          "products.$.status": status,
          "products.$.delivered": new Date(),
        },
      }
    )
      .then((resp) => {
        res.status(200).json({ resp });
      })
      .catch((err) => {
        res.status(400).json({ err });
      });
  } else {
    await Order.updateOne(
      { _id: objectId(orderId), "products.id": objectId(prodId) },
      { $set: { "products.$.status": status } }
    )
      .then((resp) => {
        res.status(200).json({ resp });
      })
      .catch((err) => {
        res.status(400).json({ err });
      });
  }
};

//DELIVERED STATUS API

const deliveredStatus = (req, res) => {
  const { status, orderId, prodId } = req.body;
};

//CANCEL ORDER API
const cancelProduct = async (req,res) => {
  const { id, orderId, proId } = req.body;
  console.log(id,orderId,proId);
 let resp= await Order.updateOne(
    { _id: objectId(orderId), "products.id": objectId(proId) },
    { $set: { "products.$.status": "Cancelled" } }
  );
  console.log(resp);
  Order.aggregate([
    {
      $match: { userId: id },
    },
    {
      $unwind: "$products",
    },
  ])
    .then((order) => {
      res.status(200).json({ order });
    })
    .catch((err) => {
      res.staus(400).json({ err });
    });
};

//GET ORDER HISTORY API
const orderHistory = (req, res) => {
  const id = req.params.id;

  Order.aggregate([
    {
      $match: { userId: id },
    },
    {
      $unwind: "$products",
    },
  ])
    .then((order) => {
      res.status(200).json({ order });
    })
    .catch((err) => {
      res.staus(400).json({ err });
    });
};
//GET SINGLE ORDERED PRODUCT DETAILS
const OrderedProduct=(req,res)=>{
 const {orderId,proId} = req.body
 Order.aggregate([
  {
    $match: { _id:orderId },
  },
  {
    $unwind: "$products",
  },
  {
    $match:{"$products.$.id":objectId(proId)}
  }
]).then((resp)=>{
  console.log(resp);
}).catch((err)=>{
  console.log(err);
})
}


//GET LATEST ORDERS API
const latestOrders = (req, res) => {
  Order.aggregate([
    {
      $unwind: "$products",
    },
  ])
    .sort({ createdAt: -1 })
    .limit(5)
    .then((orders) => {
      res.status(200).json({ orders });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};

//APPLY COUPON API
const applyCoupon = async (req, res) => {
  const { userId, couponCode } = req.body;

  let checkCoupon = await Coupon.findOne({ code: couponCode });

  if (checkCoupon) {
    let userExist = checkCoupon.userId.findIndex((users) => users == userId);
    console.log(userExist);
    if (userExist == -1) {
      Coupon.updateOne(
        { code: couponCode },
        {
          $push: { userId: userId },
        }
      ).then((resp) => {
        return res.status(200).json({ checkCoupon });
      });
    } else {
      res.status(400).json({ errorMessage: "Coupon already applied" });
    }
  } else {
    res.status(400).json({ errorMessage: "Invalid Coupon" });
  }
};
//SALES REPORT API
const salesReport = (req, res) => {
  Order.aggregate([
    { $unwind: "$products" },

    {
      $match: { "products.status": "delivered" },
    },
  ])
    .then((report) => {
      res.status(200).json({ report });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};
//FILTERED SALES REPORT API
const filteredReport = (req, res) => {
  const { fromDate, toDate } = req.body;

  Order.aggregate([
    { $unwind: "$products" },
    {
      $match: {
        "products.status": "delivered",
        date: { $gte: new Date(fromDate), $lte: new Date(toDate) },
      },
    },
  ])
    .then((report) => {
      res.status(200).json({ report });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};
//GET DAILY SALES REPORT
const dailyReport=(req,res)=>{
  let today=new Date();
  today=new Date(today.setHours(0,0,0,0)).toISOString();
  Order.aggregate([
    { $unwind: "$products" },
    {
      $match: {
        "products.status": "delivered",
         "products.delivered":{$gte:new Date(today)},
      },
    },
  ]).then((report)=>{
    res.status(200).json({report})
  }).catch((err)=>{
    res.status(400).json({err})
  })

}

//GET WEEKLY REPORT
const weeklyReport=(req,res)=>{

  let day = new Date().getDay();
  console.log(day);
  if (day==0){
    day=7;
  }else if (day==1){
    day =2
  }
  
  let nowDate = new Date(Date.now()-day*24*60*60*1000)
  let date = new Date(nowDate.setHours(0,0,0,0)).toISOString()
  console.log(date);
  console.log(nowDate);
  console.log(Date.now());

  Order.aggregate([
    { $unwind: "$products" },
    {
      $match: {
        "products.status": "delivered",
         "products.delivered":{$gte:new Date(date)},
      },
    },
  ]).then((report)=>{
    console.log(report);
    res.status(200).json({report})
  }).catch((err)=>{
    res.status(400).json({err})
  })

}
//GET MONTHLY REPORT

const monthlyReport=(req,res)=>{
   let month = new Date();
   let firstMonth = new Date(month.getFullYear(),month.getMonth(),1)
   let date = new Date(firstMonth.setHours(0,0,0,0)).toISOString()

   
  Order.aggregate([
    { $unwind: "$products" },
    {
      $match: {
        "products.status": "delivered",
         "products.delivered":{$gte:new Date(date)},
      },
    },
  ]).then((report)=>{
    console.log(report);
    res.status(200).json({report})
  }).catch((err)=>{
    res.status(400).json({err})
  })

}
//GET YEARLY REPORT
const yearlyReport=(req,res)=>{
    
 let currentYear= new Date().getFullYear()
 currentYear=currentYear+"-"+"01-01"
 console.log(currentYear);
 currentYear=new Date(currentYear);
 console.log(currentYear);
 const date = new Date(currentYear).toISOString
 Order.aggregate([
  { $unwind: "$products" },
  {
    $match: {
      "products.status": "delivered",
       "products.delivered":{$gte:new Date(date)},
    },
  },
]).then((report)=>{
  console.log(report);
  res.status(200).json({report})
}).catch((err)=>{
  res.status(400).json({err})
})



}


// GET MONTHLY INCOME
const monthlyIncome = (req, res) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));
  Order.aggregate([
    {
      $match: {
        createdAt: { $gte: previousMonth },
      },
    },
    {
      $unwind: "$products",
    },
    {
      $project: {
        month: { $month: "$createdAt" },
        sales: "$products.price",
      },
    },
    {
      $group: {
        _id: "$month",
        total: { $sum: "$sales" },
      },
    },
  ])
    .then((income) => {
      res.status(200).json({ income });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};

//GET ORDER COUNT
const totalCount = (req, res) => {
  Order.find({})
    .count()
    .then((count) => {
      res.status(200).json({ count });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};

module.exports = {
  addAddress,
  getAddress,
  getOrders,
  orderHistory,
  OrderedProduct,
  changeStatus,
  deliveredStatus,
  verifyPayment,
  applyCoupon,
  salesReport,
  filteredReport,
  latestOrders,
  monthlyIncome,
  totalCount,
  cancelProduct,
  dailyReport,
  weeklyReport,
  monthlyReport,
  yearlyReport
};
