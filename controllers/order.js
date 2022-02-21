const User = require("../models/User");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const Cart = require("../models/Cart");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const shortid = require("shortid");
const objectId = mongoose.Types.ObjectId;
const crypto = require("crypto");
const { log } = require("console");
const { report } = require("process");

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
            } else {
              const razorpayMethod = () => {
                console.log(resp);
                const options = {
                  amount: amount * 100,
                  currency: "INR",
                  receipt: "" + orderId,
                  payment_capture: 1,
                };
                console.log(options);

                razorpay.orders
                  .create(options)
                  .then((response) => {
                    console.log(response);
                    res.status(200).json({
                      id: response.id,
                      currency: response.currency,
                      amount: response.amount,
                      receipt: "" + orderId,
                    });
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              };

              razorpayMethod();
            }
          });
        })
        .catch((err) => {
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
//RAZORPAY VERIFICATION API
const verifyPayment = (req, res) => {
  console.log(req.body);
  const { response, order } = req.body;
  console.log(response);
  console.log("verify ayittriunddddd");
  console.log(order);
  let hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY);
  console.log("endjavvannnn");

  hmac.update(response.razorpay_order_id + "|" + response.razorpay_payment_id);
  console.log("vallathum nadakkoooo");
  console.log(hmac);

  hmac = hmac.digest("hex");
  console.log(hmac);
  console.log(response.razorpay_signature);
  if (hmac == response.razorpay_signature) {
    console.log("verify ayittriunddddd");
    Order.updateOne(
      { _id: objectId(order.data.receipt) },
      {
        $set: {
          status: "paid",
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
  console.log(userId);

  User.findOne({ _id: objectId(userId) }, { address: 1 })
    .then((adr) => {
      res.status(200).json({ address: adr.address });
    })
    .catch((err) => {
      console.log(err);
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
      console.log(resp);
      res.status(200).json({ resp });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ err });
    });
};
// STATUS CHANGE API
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

//GET ORDER HISTORY API
const orderHistory = async (req, res) => {
  const id = req.params.id;
  console.log(id);
  await Order.aggregate([
    {
      $match: { userId: id },
    },
    {
      $unwind: "$products",
    },
  ])
    .then((order) => {
      console.log(order);
      res.status(200).json({ order });
    })
    .catch((err) => {
      res.staus(400).json({ err });
    });
};

//GET LATEST ORDERS API
const latestOrders =(req,res)=>{
  Order.aggregate([
    {
      $unwind: "$products",
    },
  ]).sort({ createdAt: -1 }).limit(5)
    .then((orders) => {
      console.log(orders);
      res.status(200).json({ orders});
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ err });
    });

}



//APPLY COUPON API
const applyCoupon = async (req, res) => {
  const { userId, couponCode } = req.body;
  console.log(req.body);
  let checkCoupon = await Coupon.findOne({ code: couponCode });
  console.log(checkCoupon);

  if (checkCoupon) {
    let userExist = checkCoupon.userId.findIndex((users) => users == userId);
    console.log(userExist);
    if (userExist == -1) {
      Coupon.updateOne(
        { code: couponCode },
        {
          $push: { userId: userId },
        }
      )
        .then((resp) => {
          res.status(200).json({ checkCoupon });
        })
        .catch((err) => {
          console.log(err);
          res.status(400);
        });
    } else {
      res.status(400).json({ errorMessage: "Coupon already applied" });
    }
    res.status(200).json({ checkCoupon });
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
      console.log(report);
      res.status(200).json({ report });
    })
    .catch((err) => {
      console.log(err);
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
// GET MONTHLY INCOME
const monthlyIncome=(req,res)=>{
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));
  Order.aggregate([
    {
      $match:{
        createdAt:{$gte:previousMonth}
      }
    },
    {
       $unwind:"$products"
    },
    {
      $project:{
        month:{$month:"$createdAt"},
        sales:"$products.price"
      }
    },
    {
      $group: {
        _id: "$month",
        total: { $sum: "$sales" },
      },
    },
  ]).then((income)=>{
    console.log(income);
    res.status(200).json({income})
  }).catch((err)=>{
    console.log(err);
    res.status(400).json({err})
  })
}

// router.get("/income", verifyTokenAndAdmin, async (req, res) => {
//   const productId = req.query.pid;
//   const date = new Date();
//   const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
//   const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

//   try {
//     const income = await Order.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: previousMonth },
//           ...(productId && {
//             products: { $elemMatch: { productId } },
//           }),
//         },
//       },
//       {
//         $project: {
//           month: { $month: "$createdAt" },
//           sales: "$amount",
//         },
//       },
//       {
//         $group: {
//           _id: "$month",
//           total: { $sum: "$sales" },
//         },
//       },
//     ]);
//     res.status(200).json(income);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });


module.exports = {
  addAddress,
  getAddress,
  getOrders,
  orderHistory,
  changeStatus,
  verifyPayment,
  applyCoupon,
  salesReport,
  filteredReport,
  latestOrders,
  monthlyIncome
};
