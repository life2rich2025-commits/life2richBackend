const Offer = require("../models/Offer");
const Transaction = require("../models/PaymentModel");
const User = require("../models/userModel");

exports.getHomeData = async (req, res) => {
  try {
    const userId = req.userId;

    // User Summary
    const user = await User.findById(userId).select("wallet rewards referrals");

    // Offers
    const offers = await Offer.find().sort({ createdAt: -1 });

    // Recent Transactions
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    return res.json({
      success: true,
      home: {
        summary: {
          wallet: user.wallet,
          rewards: user.rewards,
          referrals: user.referrals
        },
        offers,
        transactions
      }
    });

  } catch (err) {
    console.log("Home API Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
