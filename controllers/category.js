const Category = require("../models/Category");
const mongoose = require("mongoose");
const objectId = mongoose.Types.ObjectId;

const createCategory = (req, res) => {
  Category.updateOne(
    { mainCategory: req.body.selectedCategory },
    { $addToSet: { subCategory: req.body.subCategory } },
    { upsert: true }
  )
    .then(async () => {
      const data = await Category.find({});
      res.json({ data });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};

const getCategory = (req, res) => {
  Category.find({})
    .then((data) => {
      res.json({ data });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};

const deleteCategory = (req, res) => {
  Category.update(
    { _id: objectId(req.params.id) },
    { $pull: { subCategory: req.params.sub } }
  )
    .then(async () => {
      const data = await Category.find({});
      res.json({ data });
    })
    .catch((err) => {
      console.log(err);
    });
};

const getSubCategory = (req, res) => {
  console.log(req.query);
  Category.findOne({ mainCategory: req.query.main })
    .then((data) => {
      console.log(data?.subCategory);
      res.json({ data: data?.subCategory || [] });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};

module.exports = {
  createCategory,
  getCategory,
  deleteCategory,
  getSubCategory,
};
