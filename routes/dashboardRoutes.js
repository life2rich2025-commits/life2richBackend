const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

router.put("/uploadImage", upload.single("uploadImage"), dashboardController.uploadImage);
router.post("/addOffer", dashboardController.addOffer);
router.get("/home", dashboardController.getHomeData);

module.exports = router;
