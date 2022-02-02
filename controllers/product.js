const Product = require("../models/Product");
const slugify = require("slugify");
const cloudinary = require("../config/cloudinary");

const addProduct = async (req, res) => {
  try {
    console.log(req.files);

    const url = [];

    const files = req.files;
    console.log(files);
    for (const file of files) {
      const { path } = file;

      await cloudinary.uploader
        .upload(path, {
          resource_type: "auto",
          folder: "E-Commerce",
        })
        .then((result) => {
          console.log(result);
          url.push({ url: result.url, id: result.public_id });
          console.log(url);
        });
    }

    const data = JSON.parse(req.body.data);

    console.log(data);
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
    res.status(201).json({ product });
  } catch (err) {
    console.log(err);
  }
};

const getProductById = (req, res) => {
  Product.findById(req.params.id)
    .then((data) => {
      res.status(200).json({ data });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

const getProduct = (req, res) => {
  Product.find({}).exec((error, product) => {
    if (error) return res.status(400).json({ error });
    if (product) {
      res.status(200).json({ product });
    }
  });
};

const deleteProduct = async (req, res) => {
  try {
    let product = awaitProduct.findById(req.params.id);
    await cloudinary.uploader.destroy(product.cloudinary_id);
    await product.remove();
    res.status(200).json({ product });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
};

const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    await cloudinary.uploader.destroy(product.cloudinary_id);

    let newProduct = [];
    if (req.files.length > 0) {
      newProduct = req.files.map((file) => {
        return file.filename;
      });
    }

    newProduct = await cloudinary.uploader.upload(req.files.path);

    const data = {
      name: req.body.name || product.name,
      slug: slugify(req.body.name) || slugify(product.name),
      price: req.body.price || product.price,
      description: req.body.description || product.description,
      discount: req.body.discount || product.discount,
      quantity: req.body.quantity || product.quantity,
      size: req.body.size || product.size,
      category: req.body.category || product.category,
      images: [newProduct.secure_url] || product.images,
      cloudinary_id: newProduct.public_id || product.cloudinary_id,
    };
    product = await Product.findByIdAndUpdate(
      (req.params.id, data, { new: true })
    );
    res.status(200).json({ product });
  } catch (err) {
    return res.status(400).json({ error });
  }
};

module.exports = {
  addProduct,
  getProduct,
  deleteProduct,
  updateProduct,
  getProductById,
};
