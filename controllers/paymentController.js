const PaymentMethod = require("../models/PaymentMethodSchema");
const Payment = require("../models/PaymentModel");
const generateOrderId = require("../utils/generateOrderId");
const User = require("../models/userModel");


exports.addPaymentMethod = async (req, res) => {
  try {
    const { type, bankDetails, upiId, setPrimary } = req.body;

    const userId = req.userId;

    if (!userId || !type)
      return res.status(400).json({ message: "userId & type required" });

    // Required validations
    if (type === "bank" && !bankDetails)
      return res.status(400).json({ message: "Bank Details required" });

    if (type === "upi" && !upiId)
      return res.status(400).json({ message: "UPI ID required" });

    // Check if a record already exists for this user
    let existingMethod = await PaymentMethod.findOne({ userId });

    //-------------------------
    //   UPDATE same row
    //-------------------------
    if (existingMethod) {
        existingMethod.type = type;
        existingMethod.isPrimary = setPrimary;
      if (type === "bank") {
        existingMethod.bankDetails = bankDetails;
      }

      if (type === "upi") {
        existingMethod.upiId = upiId;
      }

      if (setPrimary) {
        existingMethod.isPrimary = true;
      }

      await existingMethod.save();

      return res.json({
        success: true,
        message: "Updated successfully",
        data: existingMethod
      });
    }

    //-------------------------
    //   CREATE new row
    //-------------------------
    const payment = await PaymentMethod.create({
      userId,
      type,
      bankDetails: type === "bank" ? bankDetails : null,
      upiId: type === "upi" ? upiId : null,
      isPrimary: !!setPrimary
    });

    return res.json({
      success: true,
      message: "Created successfully",
      data: payment
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};



exports.getPaymentMethod = async (req, res) => {
  try {
    const userId = req.userId; // token userId

    if (!userId)
      return res.status(400).json({ message: "userId required" });

    const paymentData = await PaymentMethod.findOne({ userId });

    if (!paymentData) {
      return res.status(404).json({
        success: false,
        message: "No payment method found"
      });
    }

    return res.json({
      success: true,
      data: paymentData
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};


exports.createPayment = async (req, res) => {
  try {
    const userId = req.userId; // from token
    const { method, utrNumber, amount } = req.body;

    if (!method || !utrNumber || !amount) {
      return res.status(400).json({
        message: "method, utrNumber, amount are required"
      });
    }

    const newPayment = await Payment.create({
      userId,
      method,
      utrNumber,
      amount,
      orderId: generateOrderId(),
      Description:"Recharge Successful",
      status: "pending"
    });

    return res.json({
      success: true,
      message: "Payment submitted successfully",
      payment: newPayment
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};


// -------------------------
// 📌 Get Payment History
// -------------------------
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.userId; // from token middleware

    // Optional pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Fetch user payments
    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      // .skip(skip)
      // .limit(limit);

    const total = await Payment.countDocuments({ userId });

    return res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      payments
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};


exports.createWithdraw = async (req, res) => {
  try {
    const userId = req.userId; 
    const { method, amount } = req.body;

    //Validate fields
    if (!method || !amount) {
      return res.status(400).json({
        message: "method, utrNumber, amount are required"
      });
    }

    // Validate numeric amount
    const withdrawAmount = Number(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({
        message: "Invalid withdraw amount"
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

  
    //Create withdraw request
    const newWithdraw = await Payment.create({
      userId,
      method,
      utrNumber: "0",
      amount: withdrawAmount,
      orderId: generateOrderId(),
      Description: "Withdraw Request Submitted",
      status: "pending"     // waiting for admin approval
    });

    return res.json({
      success: true,
      message: "Withdraw request submitted successfully",
      withdraw: newWithdraw,
      walletBalance: user.ewalletAmount
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};
