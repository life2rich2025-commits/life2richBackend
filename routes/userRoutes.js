const express = require("express");
const { registerUser, getUsers, loginUser, getProfile, getReferralCode ,editProfile,gethomedash,forgotPassword ,resetPassword, getupiMobileScheme} = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload");
const router = express.Router();

router.post("/register", registerUser);
router.get("/users", getUsers);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getProfile);
router.get("/referral-code", authMiddleware, getReferralCode);
router.put("/edit-profile", authMiddleware, upload.single("profileImage"), editProfile);
router.get("/homedash", gethomedash);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/get-uip-mobile", getupiMobileScheme);

module.exports = router;
