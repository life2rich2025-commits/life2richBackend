const Voucher = require("../models/voucherSchema");
const Winner = require("../models/WinnerModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");

const {generateVouchers }= require("../utils/generateVouchers");

exports.createVoucher = async (req, res) => {
  try {
    await generateVouchers(req.body);
    res.json({
      success: true,
      message: "Vouchers created successfully",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};



exports.scratchVoucher = async (req, res) => {
  try {
    const { voucherId, winngAmount } = req.body;
    const userId = req.userId;

    let voucher = await Voucher.findOne({ voucherId: voucherId })

    if (!voucher)
      return res.status(404).json({ message: "Voucher not found" });

    if (voucher.isScratched)
      return res.status(400).json({ message: "Already scratched" });

    let vouchers = await Voucher.findOneAndUpdate(
      { voucherId: voucherId },
      {
        $set: {
          status: "expired",      // or whatever status you want
          isScratched: true     // or true depending on your logic
        }
      },
      { new: true } // return updated document
    );

    // Winning Amount 

    // 4️⃣ If winning amount > 0 → update user's ewallet
    let updatedUser = null;

    if (winngAmount > 0) {

      //Get user
      const user = await User.findById(userId);

      //Deduct the amount from e-wallet
      user.ewalletAmount = (Number(user.ewalletAmount)+Number(winngAmount)).toString();


      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { ewalletAmount: user.ewalletAmount } },  // add money to wallet
        { new: true } // return updated user
      );
      console.log(updatedUser)
    }


    // Random win amount logic
    const WinnerModel = await Winner.create({
      userId: userId,
      voucherId: voucherId,
      winnerAmount: winngAmount,
    });

    return res.json({
      success: true,
      voucher,
      WinnerModel
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.getMyVouchers = async (req, res) => {
  try {
    const userId = req.userId;


    const winnerTable = await Winner.find({ userId: userId});

    const totalWinnerAmount = winnerTable.reduce((sum, item) => {
      return sum + Number(item.winnerAmount);
    }, 0);


    const vouchers = await Voucher.find({
      isScratched: false,
      status: "active"
    }).sort({ amount: -1 });


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
      totalVoucher: vouchers.length,
      totalValue: totalWinnerAmount,
      scratchVoucher: winnerTable.length,
      vouchers: grouped
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};



exports.onVaildVoucherUser = async (req, res) => {
  try {
    let { voucherAmount, voucherId } = req.body;
    const userId = req.userId;

    //Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user" });
    }

    //Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    //Validate voucher amount
    if (!voucherAmount || isNaN(voucherAmount) || voucherAmount <= 0) {
      return res.status(400).json({ error: "Invalid voucher amount" });
    }

    //Check if user has enough e-wallet balance
    if (user.ewalletAmount < voucherAmount) {
      return res.status(400).json({ error: "Insufficient wallet balance" });
    }

    //Deduct the amount from e-wallet
    user.ewalletAmount -= voucherAmount;
    console.log(voucherId)

    const voucherDetails = await Voucher.findOne({ voucherId: voucherId });

    console.log(voucherDetails)

    await User.findByIdAndUpdate(
      userId,
      [{ $set: { ewalletAmount: { $toDouble: user.ewalletAmount } } }],
      { new: true }
    );

    return res.status(200).json({
      message: "Voucher applied successfully",
      walletBalance: user.ewalletAmount,
      schemes: user,
      voucher: voucherDetails
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};


