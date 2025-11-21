const router = require("express").Router();
const voucher = require("../controllers/voucherController");
const auth = require("../middleware/auth");

router.post("/create", auth, voucher.createVoucher);      // Admin/API
router.post("/scratch", auth, voucher.scratchVoucher);
router.get("/my-vouchers", auth, voucher.getMyVouchers);

module.exports = router;
