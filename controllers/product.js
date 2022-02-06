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
      products = await Product.find();
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
 

   let update_product= Product.updateOne(
      { _id: req.params.id },
      {
        $set: {
          name: data.productName,
          slug: slugify(data.productName) ,
          price: data.price ,
          description: data.description ,
          discount: data.discount ,
          quantity: data.quantity ,
          size: data.size,
          mainCategory: data.selectedCategory ,
          subCategory: data.selectedSubCategory,
          img1: url[0] ,
          img2: url[1],
          img3: url[2] ,
          img4: url[3] ,
        },
      }
    )
  
   res.status(201).json({ update_product});
     
    
    
  } catch (err) {
    return res.status(400).json({ err });
  }
};

module.exports = {
  addProduct,
  getProduct,
  deleteProduct,
  updateProduct,
  getProductById,
};
