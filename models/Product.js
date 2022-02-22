const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    discount: {
      type: Number,
    },
    quantity: {
      type: Number,
      required: true,
    },
    img1: {
      type: Array,
    },
    img2: {
      type: Array,
    },
    img3: {
      type: Array,
    },
    img4: {
      type: Array,
    },
    size: {
      type: Array,
    },
    Offer: {
      type: Boolean,
      default: false,
    },
    mainCategory: {
      type: String,
    },
    subCategory: {
      type: String,
    },
    updatedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
