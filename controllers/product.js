const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const slugify = require("slugify");
const cloudinary = require("../config/cloudinary");

const addProduct = async (req, res) => {
  try {

    const url = [];

    const files = req.files;
    for (const file of files) {
      const { path } = file;

      await cloudinary.uploader
        .upload(path, {
          resource_type: "auto",
          folder: "E-Commerce",
        })
        .then((result) => {
          url.push({ url: result.url, id: result.public_id });
        });
    }

    const data = JSON.parse(req.body.data);

    const product = new Product({
      name: data.productName,
      slug: slugify(data.productName),
      price: data.price,
      description: data.description,
      discount: data.discount,
      quantity: data.quantity,
      size: data.size,
      mainCategory: data.selectedCategory,
      subCategory: data.selectedSubCategory,
      img1: url[0],
      img2: url[1],
      img3: url[2],
      img4: url[3],
    });
    await product.save();
    res.status(200).json({ product });
  } catch (err) {
    console.log(err);
  }
};
//GET SINGLE PRODUCT
const getProductById = (req, res) => {
  Product.findById(req.params.id)
    .then((product) => {
      res.status(200).json({ product });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};
//GET ALL PRODUCTS

const getProduct = async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  try {
    let products;

    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(5);
    } else if (qCategory) {
      products = await Product.find({ mainCategory: qCategory });
    } else {
      products = await Product.find().sort({ _id: -1 });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ error });
  }
};
// DELETE PRODUCT API
const deleteProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    await cloudinary.uploader.destroy(product.img1[0].id);
    await cloudinary.uploader.destroy(product.img2[0].id);
    await cloudinary.uploader.destroy(product.img3[0].id);
    await cloudinary.uploader.destroy(product.img4[0].id);
    await product.remove();
    res.status(200).json({ product });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
};
//UPDATE PRODUCT API
const updateProduct = async (req, res) => {
  try {
    const url = [];

    const files = req.files;

    for (const file of files) {
      const { path } = file;

      await cloudinary.uploader
        .upload(path, {
          resource_type: "auto",
          folder: "E-Commerce",
        })
        .then((result) => {
          url.push({ url: result.url, id: result.public_id });
        });
    }

    const data = JSON.parse(req.body.data);

    Product.updateOne(
      { _id: req.params.id },
      {
        $set: {
          name: data.productName,
          slug: slugify(data.productName),
          price: data.price,
          description: data.description,
          discount: data.discount,
          quantity: data.quantity,
          size: push(data.size),
          mainCategory: data.selectedCategory,
          subCategory: data.selectedSubCategory,
          img1: url[0],
          img2: url[1],
          img3: url[2],
          img4: url[3],
        },
      }
    ).then((resp) => {
      res.status(200).json({ resp });
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

//CREATE COUPON OFFER
const createCoupon = async (req, res) => {
  const { name, discount, maxamount, couponcode, expdate, minPurchase } =
    req.body;
  let couponExist = await Coupon.findOne({ code: couponcode });
  if (couponExist) {
    res.status(400).json({ errorMessage: "Coupon already exist" });
  } else {
    const coupon = new Coupon({
      name: name,
      userId: [],
      discount: discount,
      maxAmount: maxamount,

      minPurchase: minPurchase,
      code: couponcode,
      expire: new Date(expdate),
      expireAt: new Date(expdate),
    });

    coupon
      .save()
      .then((resp) => {
        res.status(200).json({ resp });
      })
      .catch((err) => {
        console.log(err);
        res.status(200).json({ err });
      });
  }
};
// GET ALL PRODUCTS NAME API

const getProductsName = (req, res) => {
  Product.aggregate([
    {
      $project: {
        name: 1,
      },
    },
  ])
    .then((products) => {
      console.log(products);
      res.status(200).json({ products });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ err });
    });
};

//GET PRODUCT ID
const getProductId = (req, res) => {
  let name = req.params.id.trim();
  Product.findOne(
    { $or: [{ name: { $regex: name, $options: "i" } }] },
    { _id: 1 }
  )
    .then((id) => {
      console.log(id);
      res.status(200).json({ id });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};

//PRODUCT OFFER API
const productOffer = async (req, res) => {
  const { selectedProduct, discount } = req.body;
  let product = await Product.findById(selectedProduct);

  product
    .updateOne({ discount: discount }, { offer: true })
    .then((resp) => {
      res.status(200).json({resp})
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};

//CATEGORY OFFER API

const categoryOffer = (req, res) => {
  const { selectedSubCategory, discount } = req.body;
  Product.updateMany(
    {
      $and: [{ subCategory: selectedSubCategory }, { offer: false }],
    },
    {
      $set: {
        discount: discount,
      },
    }
  )
    .then((resp) => {
      res.status(200);
    })
    .catch((err) => {
      req.status(400).json(err);
    });
};

module.exports = {
  addProduct,
  getProduct,
  deleteProduct,
  updateProduct,
  getProductById,
  createCoupon,
  getProductsName,
  productOffer,
  categoryOffer,
  getProductId,
};
