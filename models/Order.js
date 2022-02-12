const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    products:{type:Array,required:true},
    // products: [
    //   {
    //     productId: {
    //       type: String,
    //     },
    //     quantity: {
    //       type: Number,
    //       default: 1,
    //     },
    //     price: {
    //       type: Number,
    //     }, status: { type: String, default: "pending" },
    //   },
    // ],
  
    // amount: { type: Number, required: true },
    address: { type: Object, required: true },
    method: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
