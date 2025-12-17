
const sendPushNotification = require("../notificationservices/sendNotification");
const Notification = require("../models/notification");
const userModel = require("../models/userModel")


exports.sendNotification = async (req, res) => {
    try {
        const { token, title, body } = req.body;

        console.log('token, title, body ' + token + title + body)
        if (!token) {
            return res.status(400).json({ message: "FCM token required" });
        }
        console.log('token, title, body ' + token + title + body)

        const UserData = await userModel.find({})

        for (const user of UserData) {
            if (!user.token) continue; // skip users without token

            await sendPushNotification(
                user.token,
                title,
                body,
                {
                    type: "lottery",
                    screen: "drawResult",
                }
            );
        }

        res.json({ success: true, message: "Notification sent" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};



exports.getNotificationList = async (req, res) => {
    try {
        const userId = req.userId; // token userId

        if (!userId)
            return res.status(400).json({ message: "userId required" });

        const notificationData = await Notification.find({ userId });

        const unreadCount = await Notification.countDocuments({
            userId: userId,
            isRead: false
        });

        if (!unreadCount) {
            return res.status(404).json({
                success: false,
                message: "No Notification found"
            });
        }

        return res.json({
            success: true,
            unreadCount: unreadCount,
            data: notificationData
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error" });
    }
};
