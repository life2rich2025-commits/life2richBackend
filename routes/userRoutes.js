const express = require("express");
const { registerUser, getUsers, loginUser, getProfile, getReferralCode } = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.post("/register", registerUser);
router.get("/users", getUsers);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getProfile);
router.get("/referral-code", authMiddleware, getReferralCode);


module.exports = router;
