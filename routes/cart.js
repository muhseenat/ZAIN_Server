const express = require("express");
const router = express.Router();
const cartControllers = require("../controllers/cart");

router.post("/addtocart", cartControllers.addToCart);
router.get("/getcart/:id", cartControllers.getCartItems);
router.post("/changequantity", cartControllers.changeQuantity);
router.get("/getcartcount/:id", cartControllers.getCartCount);
router.post("/deletecartproduct", cartControllers.deleteCartproduct);
module.exports = router;
