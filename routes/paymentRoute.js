const express = require("express");
const { addPaymentMethod , getPaymentMethod, createPayment,getPaymentHistory, createWithdraw} = require("../controllers/paymentController");
const router = express.Router();
const auth = require("../middleware/auth");

router.post("/add", auth, addPaymentMethod);
router.get("/payment-method", auth, getPaymentMethod);
router.post("/submit-payment", auth, createPayment);
router.get("/payment-history", auth, getPaymentHistory);
router.post("/payment-withdraw", auth, createWithdraw);

module.exports = router;
