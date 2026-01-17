const { response } = require("express");
const UploadImageScheme = require("../models/UploadImage");
const OfferSchema = require("../models/Offer");
const User = require("../models/userModel");
const Voucher = require("../models/voucherSchema");
const Payment = require("../models/PaymentModel");
const Winner = require("../models/WinnerModel");
const { generateVouchers } = require("../utils/generateVouchers");
const UpiModel = require("../models/upimodel");
const sendPushNotification = require("../notificationservices/sendNotification");
const Notification = require("../models/notification");
const transporter = require("../config/email")

exports.addVoucher = async (req, res) => {
  try {
    await generateVouchers(req.body);
    res.json({ success: true, message: "Added vouchers successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteBannerImage = async (req, res) => {
  try {
    const { bannerId } = req.body;
    const result = await UploadImageScheme.deleteOne({ _id: bannerId });
    if (result.deletedCount === 1) {
      console.log("Deleted successfully");
      res.json({ success: true, message: "Deleted successfully" });
    } else {
      console.log("No document found");
      res.json({ success: false, message: "No document found" });
    }
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
    // const getBillingInFoList = await Payment.find({ status: "pending" }).populate("userId", "name userName email phoneNumber");
    const getBillingInFoList = await Payment.find({ status: "pending" })
      .populate("userId", "name userName email phoneNumber")
      .populate({
        path: "userId",
        populate: {
          path: "paymentMethod",
          match: { isPrimary: true }  // only primary bank/upi details
        }
      });

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
      let finalAmount;
      if (updated.Description === "Withdraw Request Submitted") {
        finalAmount = Number(userPayment.ewalletAmount) - Number(updated.amount);
       await transporter.sendMail({
        from: '"Support – LifeRich" <noreplayliferich@gmail.com>',
        to: userPayment.email,
        subject: "Withdrawal Successful - LifeRich",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">

            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #2C3E50; margin-top: 10px;">LifeRich</h2>
            </div>

            <!-- Main Content -->
            <div style="text-align: center;">
              <h3 style="color: #E67E22;">Withdrawal Successful 💸</h3>

              <p style="color: #555; font-size: 16px; margin-top: 15px;">
                Your withdrawal request has been processed successfully.
              </p>

              <div style="background-color: #ffffff; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="font-size: 16px; color: #333; margin: 5px 0;">
                  <strong>Withdraw Amount:</strong> ₹${updated.amount}
                </p>
                <p style="font-size: 16px; color: #333; margin: 5px 0;">
                  <strong>Wallet Balance After Withdrawal:</strong> ₹${finalAmount}
                </p>
                <p style="font-size: 14px; color: #777; margin: 5px 0;">
                  <strong>Date:</strong> ${new Date().toLocaleString()}
                </p>
              </div>

              <p style="font-size: 14px; color: #666;">
                The withdrawn amount will be credited to your bank account shortly.
              </p>

   
            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #aaa;">
              &copy; ${new Date().getFullYear()} LifeRich. All rights reserved.
            </div>
          </div>
        `
        });

      } else {
        finalAmount = Number(userPayment.ewalletAmount) + Number(updated.amount);
        await transporter.sendMail({
        from: '"Support – LifeRich" <noreplayliferich@gmail.com>',
        to: userPayment.email,
        subject: "Recharge Successful - LifeRich",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">

            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #2C3E50; margin-top: 10px;">LifeRich</h2>
            </div>

            <!-- Main Content -->
            <div style="text-align: center;">
              <h3 style="color: #27AE60;">Recharge Successful 🎉</h3>

              <p style="color: #555; font-size: 16px; margin-top: 15px;">
                Your wallet recharge has been completed successfully.
              </p>

              <div style="background-color: #ffffff; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="font-size: 16px; color: #333; margin: 5px 0;">
                  <strong>Amount Recharged:</strong> ₹${updated.amount}
                </p>
               <p style="font-size: 16px; color: #333; margin: 5px 0;">
                  <strong>Wallet Amount:</strong> ₹${finalAmount}
                </p>
                <p style="font-size: 14px; color: #777; margin: 5px 0;">
                  <strong>Date:</strong> ${new Date().toLocaleString()}
                </p>
              </div>

              <p style="font-size: 14px; color: #666;">
                The amount has been successfully added to your LifeRich wallet.
              </p>

    
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #aaa;">
              &copy; ${new Date().getFullYear()} LifeRich. All rights reserved.
            </div>
          </div>
        `
      });
      }

      // prevent negative wallet amounts
      if (finalAmount < 0) {
        finalAmount = 0;
      }

      const userUpdatePayment = await User.findByIdAndUpdate(
        updated.userId,
        { ewalletAmount: finalAmount },   // set final amount
        { new: true }
      );

      const newNotification = new Notification({
        userId: userUpdatePayment._id, // replace with valid User ObjectId
        title: "Update Bill Information",
        description: updated.Description + " amount " + updated.amount + " Rup"
      });
      const savedNotification = await newNotification.save();

    
      console.log("Notification saved:", savedNotification);


      await sendPushNotification(userUpdatePayment.fcmToken, "Update Bill Information", updated.Description + " amount " + updated.amount + " Rup", { user: JSON.stringify(userUpdatePayment) });

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


    const UserData = await userModel.find({})

    console.log("Notification send:", addOfferScheme);

    for (const user of UserData) {
      if (!user.token) continue; // skip users without token

      await sendPushNotification(
        user.token,
        addOfferScheme.title,
        addOfferScheme.description,
        {
          type: "lottery",
          screen: "drawResult",
        }
      );
    }


    res.status(200).json({
      message: "Offer Add successfully",
      response: offerList
    });

  } catch (error) {
    res.status(500).json({ message: "Offer Add failed", error });
  }
};




exports.addupiScheme = async (req, res) => {
  try {
    const { paymentType, upiid, bussinessname } = req.body;

    // 🔍 Check duplicate UPI ID
    const existingUpi = await UpiModel.findOne({ upiid });

    if (existingUpi) {
      return res.status(409).json({
        success: false,
        message: "UPI ID already exists"
      });
    }

    // ✅ Create new UPI
    const addupiScheme = await UpiModel.create({
      paymentType,
      upiid,
      bussinessname,
      status: false
    });

    res.status(200).json({
      success: true,
      message: "Add UPI successfully",
      response: addupiScheme
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Add UPI failed",
      error
    });
  }
};



exports.getupiScheme = async (req, res) => {
  try {
    const addupiScheme = await UpiModel.find({status: true});
    res.status(200).json({
      message: "Add Upi successfully",
      response: addupiScheme
    });

  } catch (error) {
    res.status(500).json({ message: "Add Upi failed", error });
  }
};


exports.deleteupiScheme = async (req, res) => {
  try {
    const { upiId } = req.body;

    const deleted = await UpiModel.findByIdAndDelete(upiId);

    if (!deleted) {
      return res.status(404).json({ message: "UPId not found" });
    }

    res.json({ message: "UPId deleted successfully", deleted });
  } catch (error) {
    res.status(500).json({ message: "Error deleting UPId", error });
  }
};


exports.updateupiScheme = async (req, res) => {
  try {
    const { upiId, status } = req.body;
    const updated = await UpiModel.findByIdAndUpdate(
      upiId,
      { status: Boolean(status) },
      { new: true }
    );
    res.json({ success: true, upiList: updated, message: "Successfully Update UPI" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};




exports.getHomeData = async (req, res) => {
  try {

    // Total User 
    const totalUser = await User.find({});

    // Total Offers
    const totalVoucher = await Voucher.find({ isScratched: false }).sort({ createdAt: -1 });

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


exports.userPaymentHistorty = async (req, res) => {
  try {
    const users = await User.find({}).lean();
    const response = [];

    for (const user of users) {

      // ✅ Winner total
      // const winnerResult = await Winner.aggregate([
      //   { $match: { userId: user._id } },
      //   {
      //     $group: {
      //       _id: null,
      //       totalAmount: { $sum: "$winnerAmount" }
      //     }
      //   }
      // ]);

      const winnerResult = await Winner.aggregate([
        {
          $match: {
            userId: user._id
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: {
              $sum: { $toDouble: "$winnerAmount" }
            }
          }
        }
      ])

      console.log(user._id);

      console.log(winnerResult);

      // ✅ Recharge success
      const rechargeSuccess = await Payment.aggregate([
        {
          $match: {
            userId: user._id,
            status: "success",
            Description: "Recharge Successful"
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" }
          }
        }
      ]);

      // ✅ Recharge failed
      const rechargeFailed = await Payment.aggregate([
        {
          $match: {
            userId: user._id,
            status: "failed",
            Description: "Recharge Successful"
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" }
          }
        }
      ]);


        const withdrawalSuccess = await Payment.aggregate([
        {
          $match: {
            userId: user._id,
            status: "success",
            Description: "Withdraw Request Submitted"
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" }
          }
        }
      ]);

       // ✅ Recharge failed
      const withdrawalFailed = await Payment.aggregate([
        {
          $match: {
            userId: user._id,
            status: "failed",
            Description: "Withdraw Request Submitted"
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" }
          }
        }
      ]);

      response.push({
        userId: user._id,
        name: user.name,
        email: user.email,
        walletAmount: Number(user.ewalletAmount) || 0,
        totalWinningAmount: winnerResult[0]?.totalAmount || 0,
        rechargeSuccess: rechargeSuccess[0]?.totalAmount || 0,
        rechargeFailed: rechargeFailed[0]?.totalAmount || 0,
        withdrawalSuccess: withdrawalSuccess[0]?.totalAmount || 0,
        withdrawalFailed: withdrawalFailed[0]?.totalAmount || 0
      });
    }

    res.json({
      success: true,
      data: response,
      message: "User payment history fetched successfully"
    });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.find({});
    res.json({ success: true, message: "Get User Details" , user:user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.getWinnerList = async (req, res) => {
  try {
    const data = await getWinnersWithFilters(req.query);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getWinnersWithFilters = async (filters) => {
  const {
    userId,
    voucherId,
    status,
    fromDate,
    toDate,
    minWinAmount,
    maxWinAmount
  } = filters;

  const pipeline = [];

  // 🔹 Filter on Winner collection
  const winnerMatch = {};

  if (userId) {
    winnerMatch.userId = userId;
  }

  if (voucherId) {
    winnerMatch.voucherId = voucherId;
  }

  if (fromDate || toDate) {
    winnerMatch.createdAt = {};
    if (fromDate) winnerMatch.createdAt.$gte = new Date(fromDate);
    if (toDate) winnerMatch.createdAt.$lte = new Date(toDate);
  }

  if (Object.keys(winnerMatch).length > 0) {
    pipeline.push({ $match: winnerMatch });
  }

  // 🔹 Join User
  // pipeline.push(
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "userId",
  //       foreignField: "_id",
  //       as: "user"
  //     }
  //   },
  //   { $unwind: "$user" }
  // );

  pipeline.push({
    $lookup: {
      from: "users",
      let: { userId: { $toObjectId: "$userId" } },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$userId"] }
          }
        }
      ],
      as: "user"
    }
  });


  // 🔹 Join Voucher
  pipeline.push(
    {
      $lookup: {
        from: "vouchers",
        localField: "voucherId",
        foreignField: "voucherId",
        as: "voucher"
      }
    },
    { $unwind: "$voucher" }
  );

  // 🔹 Filter on Voucher fields
  const voucherMatch = {};

  if (status) {
    voucherMatch["voucher.status"] = status;
  }

  if (minWinAmount || maxWinAmount) {
    voucherMatch["voucher.winAmount"] = {};
    if (minWinAmount) voucherMatch["voucher.winAmount"].$gte = Number(minWinAmount);
    if (maxWinAmount) voucherMatch["voucher.winAmount"].$lte = Number(maxWinAmount);
  }

  if (Object.keys(voucherMatch).length > 0) {
    pipeline.push({ $match: voucherMatch });
  }

  // 🔹 Final projection
  pipeline.push({
    $project: {
      _id: 1,
      voucherId: 1,
      winnerAmount: 1,
      createdAt: 1,
      "user._id": 1,
      "user.name": 1,
      "user.userName": 1,
      "user.email": 1,
      "voucher.categoryAmount": 1,
      "voucher.winAmount": 1,
      "voucher.status": 1,
      "voucher.isScratched": 1
    }
  });

  console.log(pipeline);

  return Winner.aggregate(pipeline);
};

