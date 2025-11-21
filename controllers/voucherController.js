const Voucher = require("../models/voucherSchema");


exports.createVoucher = async (req, res) => {
  try {
    const { amount, expiresAt } = req.body;
     const userId = req.userId; // from token middleware

    if (!amount || !userId || !expiresAt)
      return res.status(400).json({ message: "All fields required" });

    const voucher = await Voucher.create({
      userId,
      amount,
      payText: `Pay ₹${amount} Rupee`,
      expiresAt
    });

    return res.json({
      success: true,
      voucher
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};



exports.scratchVoucher = async (req, res) => {
  try {
    const { voucherId } = req.body;
    const userId = req.userId;

    let voucher = await Voucher.findOne({ _id: voucherId, userId });

    if (!voucher)
      return res.status(404).json({ message: "Voucher not found" });

    if (voucher.isScratched)
      return res.status(400).json({ message: "Already scratched" });

    // Random win amount logic
    const possibleWins = [0, 2, 4, 10, 20, 30, 50, 100];
    const winAmount = possibleWins[Math.floor(Math.random() * possibleWins.length)];

    voucher.isScratched = true;
    voucher.winAmount = winAmount;
    await voucher.save();

    return res.json({
      success: true,
      winAmount,
      voucher
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.getMyVouchers = async (req, res) => {
  try {
    const userId = req.userId;

    const vouchers = await Voucher.find({ userId }).sort({ amount: -1 });

    let grouped = {
      "100": [],
      "50": [],
      "10": []
    };

    vouchers.forEach(v => {
      grouped[v.amount].push(v);
    });

    return res.json({
      success: true,
      vouchers: grouped
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
