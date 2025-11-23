const Voucher = require("../models/voucherSchema");
const { v4: uuidv4 } = require("uuid"); // UUID library for unique IDs


exports.createVoucher = async (req, res) => {
  try {
    let { userId, amount, limitVoucher, winPrizeRange } = req.body;

    let oldWinPrizeRange = winPrizeRange;
    let newWinPrizeRange = winPrizeRange;

    const prizeTable = {
      100: { consolation: [10, 5, 50, 20, 55, 32, 20, 2, 1, 8, 10, 20, 26] },
      50: { consolation: [10, 5, 50, 20, 55, 32, 20, 2, 1, 8, 10, 20, 26] },
      10: { consolation: [10, 5, 50, 20, 55, 32, 20, 2, 1, 8, 10, 20, 26] }
    };

    // Validation
    if (!userId || !amount || !limitVoucher || limitVoucher <= 0 || !winPrizeRange || winPrizeRange <= 0) {
      return res.status(400).json({ message: "All fields are required and limitVoucher + winPrizeRange must be > 0" });
    }

    // Random integer from 1 to max-1
    function randomLessThanExclusive(max) {
      return Math.floor(Math.random() * (max - 1)) + 1;
    }

    function calculateWinAmount(amount, position, winPrizeRange, limitVoucher) {
      const table = prizeTable[amount];
      if (!table) return 0;

      if (position % winPrizeRange === 0) {
        const prizeIndex = randomLessThanExclusive(table.consolation.length);
        const winAmount = table.consolation[prizeIndex];
        console.log(position, "→ 0");
        return winAmount
      } else {
        console.log(position, "→ 0");
        return 0
      }

    }


    // Prepare vouchers
    const vouchers = Array.from({ length: limitVoucher }, (_, index) => {
      const position = index + 1;

      const result = calculateWinAmount(amount, position, newWinPrizeRange, limitVoucher);

      return {
        userId,
        categoryAmount: amount,
        voucherId: `VCHR-${uuidv4()}`,
        winAmount: result,
        position
      };
    });


    await Voucher.insertMany(vouchers);

    return res.json({
      success: true,
      message: "Vouchers created successfully"
    });

  } catch (err) {
    console.error(err);
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

    const vouchers = await Voucher.find({ }).sort({ amount: -1 });

    let grouped = {
      "100": [],
      "50": [],
      "10": []
    };

    vouchers.forEach(v => {
      grouped[v.categoryAmount].push(v);
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
