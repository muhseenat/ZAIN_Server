const express = require("express");
const router = express.Router();
const orderControllers = require("../controllers/order");

router.post("/create", orderControllers.addAddress);
router.get("/getaddress/:id", orderControllers.getAddress);
router.get("/getorders", orderControllers.getOrders);
router.put("/changestatus", orderControllers.changeStatus);
router.post("/verifypayment", orderControllers.verifyPayment);
router.get("/order-history/:id", orderControllers.orderHistory);
router.post("/apply-coupon", orderControllers.applyCoupon);
router.get("/get-sales-report", orderControllers.salesReport);
router.post("/get-filter-report", orderControllers.filteredReport);
router.get("/get-latest-orders", orderControllers.latestOrders);
router.get("/get-income", orderControllers.monthlyIncome);
router.get("/get-total-orders", orderControllers.totalCount);
module.exports = router;
