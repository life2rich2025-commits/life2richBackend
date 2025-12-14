const express = require("express");
const router = express.Router();
const sendPushNotification = require("../notificationservices/sendNotification");

router.post("/send", async (req, res) => {
  try {
    const { token, title, body } = req.body;

    console.log('token, title, body ' +token + title + body)
    if (!token) {
      return res.status(400).json({ message: "FCM token required" });
    }
    console.log('token, title, body ' +token + title + body)

    await sendPushNotification(token, title, body, {
      type: "lottery",
      screen: "drawResult",
    });

    res.json({ success: true, message: "Notification sent" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
