const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const auth = require("../middleware/auth");

router.post("/send", notificationController.sendNotification);
router.get("/getNotification",auth,notificationController.getNotificationList);
router.get("/getAllNotification",notificationController.sendNotification);


module.exports = router;
