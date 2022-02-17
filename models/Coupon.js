const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    userId:{
        type:Array
    },
    discount: {
      type: Number,
      required:true,
    },
    maxAmount: {
      type: Number,
      required:true,
    },
    minAmount: {
      type: Number,
      required:true,
    },
    minPurchase: {
      type: Number,
      required:true,
    },
    code: {
      type: String,
    },
    expire: {
      type: Date,
    },
    expireAt: {
      type: Date,
      default: Date.now,
     
    },
  },
  { timestamps: true }

);
// CouponSchema.createIndex({"expireAt":1},{expireAfterSeconds:0})
module.exports = mongoose.model("Coupon", CouponSchema);
