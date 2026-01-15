const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

router.put("/uploadImage", upload.single("uploadImage"), dashboardController.uploadImage);
router.post("/addOffer", dashboardController.addOffer);
router.get("/home", dashboardController.getHomeData);
router.post("/addVoucher", dashboardController.addVoucher);
router.get("/getVoucher", dashboardController.getVoucher);
router.post("/updateVoucher", dashboardController.updateVoucher);
router.post("/deleteVoucher", dashboardController.deleteVoucher);
router.get("/getBillingInFo", dashboardController.getBillingInFo);
router.post("/updateBillingStatus", dashboardController.updateBillingStatus);
router.post("/deleteBannerImage", dashboardController.deleteBannerImage);
router.post("/addupi", dashboardController.addupiScheme);
router.get("/getupi", dashboardController.getupiScheme);
router.post("/deleteupi",dashboardController.deleteupiScheme)
router.post("/updateupi",dashboardController.updateupiScheme)
router.get("/userPaymentHistorty",dashboardController.userPaymentHistorty)
router.get("/getUserDetails",dashboardController.getUserDetails)
router.get("/getWinnerList",dashboardController.getWinnerList)


module.exports = router;
