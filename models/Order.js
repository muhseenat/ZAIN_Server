const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    products: { type: Array, required: true },

    address: { type: Object, required: true },
    method: { type: String },
    date:{type:Date}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
