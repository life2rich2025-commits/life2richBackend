const { response } = require("express");
const UploadImageScheme = require("../models/UploadImage");
const OfferSchema = require("../models/Offer");
const User = require ("../models/userModel");
const Voucher = require("../models/voucherSchema");
const Winner = require("../models/WinnerModel");

exports.uploadImage = async (req, res) => {
  try {
    const { imagetag, status } = req.body;

    let updateData = {
      imagename: req.file.filename,
      tag : imagetag,
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
    const { title, description,validTill } = req.body;

    let addOfferData = {
      title: title,
      description : description,
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
    const totalVoucher= await Voucher.find().sort({ createdAt: -1 });

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
      reponse : {
        totalAmountEarn:totalAmountEarn?.[0]?.totalCategoryAmount ?? 0,
        totalUser:totalUser ?? 0,
        totalVoucher: totalVoucher ?? 0,
        scratedVoucher: scratedVoucher ?? 0,
        imageUrl:UploadImages,
        offer:offerList
      }
    });

  } catch (err) {
    console.log("Home API Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};