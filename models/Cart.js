const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    products:{type:Array},
    // products: [
    //   {
    //     productId: {
    //       type: String,
    //     },
    //     productName:{
    //       type:String,
    //     },
    //     quantity: {
    //       type: Number,
    //       default: 1,
    //     },
    //     price:{
    //       type:Number,
    //     },
    //     size:{
    //       type:String
    //     },
    //     productImg:{
    //       type:String
    //     }
    //   },
    // ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);
