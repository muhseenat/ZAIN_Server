const Cart = require("../models/Cart");

const addToCart = async (req, res) => {
  console.log(req.body);
  const product_id = req.body.cartProducts[0];
  const product_img = req.body.cartProducts[1];
  const quantity = req.body.cartProducts[2];
  const size = req.body.cartProducts[3];
  const productName = req.body.cartProducts[4];
  const price = req.body.cartProducts[5];
  const total = price * quantity;
  let cartProduct = [];
  cartProduct.push({
    product_id,
    product_img,
    quantity,
    size,
    productName,
    total,
  });
  console.log(cartProduct);
  const { userId } = req.body;
  let userCart = await Cart.findOne({ userId: userId });
  if (userCart) {
    let productExist = userCart.products.findIndex(
      (product) => product.product_id == product_id
    );
    console.log(productExist);
    if (productExist != -1) {
      //userid for checking multiple user
      Cart.updateOne(
        { userId: userId, "products.product_id": product_id },
        {
          $inc: { "products.$.quantity": quantity },
          $mul: { "products.$.total": quantity },
        }
      ).then((resp) => {
        //  res.status(200).json({resp})
        console.log(resp);
      });
    } else {
      Cart.updateOne(
        { userId: userId },
        { $push: { products: cartProduct } }
      ).then((resp) => {
        console.log(resp);
      });
    }
  } else {
    const item = new Cart({
      userId: userId,
      products: cartProduct,
    });
    await item.save();

    console.log(item.products);
  }
};

const getCartItems = (req, res) => {

  const userId = req.params.id;
  Cart.find({ userId: userId }).then((resp) => {
    console.log(resp);

    console.log(resp._id);
    res.status(200).json({ resp });
  });
};

module.exports = { addToCart, getCartItems };
