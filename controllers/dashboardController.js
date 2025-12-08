const { response } = require("express");
const UploadImageScheme = require("../models/UploadImage");
const OfferSchema = require("../models/Offer");
const User = require("../models/userModel");
const Voucher = require("../models/voucherSchema");
const Payment = require("../models/PaymentModel");
const Winner = require("../models/WinnerModel");
const { generateVouchers } = require("../utils/generateVouchers");


exports.addVoucher = async (req, res) => {
  try {
    await generateVouchers(req.body);
    res.json({ success: true, message: "Added vouchers successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.getVoucher = async (req, res) => {
  try {
    const voucherList = await Voucher.find({ isScratched: { $ne: true } });
    res.json({ success: true, voucherList: voucherList, message: "Successfully Getting Voucher" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.getBillingInFo = async (req, res) => {
  try {
    const getBillingInFoList = await Payment.find({ status: "pending" }).populate("userId", "name userName email phoneNumber");
    res.json({ success: true, billInfoList: getBillingInFoList, message: "Successfully Getting Amount" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.updateBillingStatus = async (req, res) => {
  try {
    const { paymentId, status } = req.body;

    if (!paymentId || !status) {
      return res.status(400).json({ message: "paymentId and status are required" });
    }

    const updated = await Payment.findByIdAndUpdate(
      paymentId,
      { status: status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (status == "success") {
      const userPayment = await User.findById(updated.userId)
      // add and assign
      let finalAmount = Number(userPayment.ewalletAmount) + Number(updated.amount);
      const userUpdatePayment = await User.findByIdAndUpdate(
        updated.userId,
        { ewalletAmount: finalAmount },   // set final amount
        { new: true }
      );

      console.log("Updated Wallet:", userUpdatePayment.ewalletAmount);

    }

    res.json({
      success: true,
      message: "Status updated successfully",
      updatedPayment: updated,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.updateVoucher = async (req, res) => {
  try {
    const { voucherId, winamount } = req.body;
    const updated = await Voucher.findByIdAndUpdate(
      voucherId,
      { winAmount: winamount },
      { new: true }
    );
    res.json({ success: true, voucherList: updated, message: "Successfully Update Voucher" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteVoucher = async (req, res) => {
  try {
    const { voucherId } = req.body;

    const deleted = await Voucher.findByIdAndDelete(voucherId);

    if (!deleted) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    res.json({ message: "Voucher deleted successfully", deleted });
  } catch (error) {
    res.status(500).json({ message: "Error deleting voucher", error });
  }
};



exports.uploadImage = async (req, res) => {
  try {
    const { imagetag, status } = req.body;

    let updateData = {
      imagename: req.file.filename,
      tag: imagetag,
      status: true,
    };

    // If user uploads an image
    if (req.file) {
      updateData.imageUrl = `/upload_profile/${req.file.filename}`;
    }

    const updatedImageUser = await UploadImageScheme.insertOne(
      updateData,
      { new: true }
    );

    const updatedImageUserList = await UploadImageScheme.find({});


    res.status(200).json({
      message: "Image Upload successfully",
      response: updatedImageUserList
    });

  } catch (error) {
    res.status(500).json({ message: "Image Upload failed", error });
  }
};

exports.addOffer = async (req, res) => {
  try {
    const { title, description, validTill } = req.body;

    let addOfferData = {
      title: title,
      description: description,
      validTill: validTill,
    };

    const addOfferScheme = await OfferSchema.insertOne(
      addOfferData,
      { new: true }
    );

    const offerList = await OfferSchema.find({});
    res.status(200).json({
      message: "Offer Add successfully",
      response: offerList
    });

  } catch (error) {
    res.status(500).json({ message: "Offer Add failed", error });
  }
};



exports.getHomeData = async (req, res) => {
  try {

    // Total User 
    const totalUser = await User.find({});

    // Total Offers
    const totalVoucher = await Voucher.find({isScratched : false}).sort({ createdAt: -1 });

    // Total Scrated Voucher
    const scratedVoucher = await Winner.find().sort({ createdAt: -1 });


    const totalAmountEarn = await Winner.aggregate([
      {
        $lookup: {
          from: "vouchers",         // collection name
          localField: "voucherId",  // Winner.voucherId (String)
          foreignField: "voucherId",// Voucher.voucherId (String)
          as: "voucherDetails"
        }
      },
      { $unwind: "$voucherDetails" },

      {
        $group: {
          _id: null,
          totalCategoryAmount: {
            $sum: { $toDouble: "$voucherDetails.categoryAmount" } // convert string → number
          }
        }
      },

      {
        $project: {
          _id: 0,
          totalCategoryAmount: 1
        }
      }
    ]);

    //Images

    const UploadImages = await UploadImageScheme.find({});

    //available Offer
    const offerList = await OfferSchema.find({});


    return res.json({
      success: true,
      message: "Successfully to reponse",
      reponse: {
        totalAmountEarn: totalAmountEarn[0].totalCategoryAmount,
        totalUser: totalUser ?? 0,
        totalVoucher: totalVoucher ?? 0,
        scratedVoucher: scratedVoucher ?? 0,
        imageUrl: UploadImages,
        offer: offerList
      }
    });

  } catch (err) {
    console.log("Home API Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};