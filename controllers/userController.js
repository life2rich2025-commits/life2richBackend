const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const UploadImageScheme = require("../models/UploadImage");
const Offer = require("../models/Offer");
const transporter = require("../config/email");
const crypto = require("crypto");
const notificationController = require("../controllers/notificationController");
const ReferralCode = require("../models/referalCode")

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, "MY_SECRET_KEY", { expiresIn: "30d" });
};


// Register User
exports.registerUser = async (req, res) => {
  try {
    const { name, userName, email, password, confirmPassword, phoneNumber, referralCode } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      userName,
      email,
      password: password,
      confirmPassword: "",
      phoneNumber,
      profileImageUrl: "",
      ewalletAmount: "0",
      rewards: "0",
      referral: "0",
      referralCode: generateNameReferral(name),
      frdReferralCode: referralCode
    });

    console.log("referralCode"+referralCode)
   
    if (referralCode && referralCode.trim().length > 0) {

      console.log("newUser._id:", newUser._id);
      console.log("referralCode:", referralCode);

      const referralUser = await User.findOne({ referralCode });

      if (!referralUser) {
        console.log("Invalid referral code");
        return;
      }

      const referral = new ReferralCode({
        userId: referralUser._id,
        usedUserId: newUser._id,
        referralCode
      });

      const savedData = await referral.save();

      console.log("savedData:", savedData);

      const referalCount = Number(referralUser.referral) + 1
       //Increment referral count in User table
        await User.updateOne(
          { _id: referralUser._id },
          { $set: { referral: referalCount } }
        );
    }


    res.status(201).json({
      message: "User Registered Successfully",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Registration Failed", error });
  }
};

// Get All Users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // remove password
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};


// Login User
exports.loginUser = async (req, res) => {
  try {
    const { userName, password, fcmToken, appVersion } = req.body;

    const user = await User.findOne({ userName });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    if (password !== user.password) {
      return res.status(401).json({ message: "Incorrect Password" });
    }

    // 🔹 Update FCM token only if provided & changed
    let updated = false;

    if (fcmToken && user.fcmToken !== fcmToken) {
      user.fcmToken = fcmToken;
      updated = true;
    }



    if (appVersion && user.appVersion !== appVersion) {
      user.appVersion = appVersion;
      updated = true;
    }

    if (updated) {
      await user.save();
    }

    let unreadCount = 0;

    try {
      unreadCount = await Notification.countDocuments({
        userId: user._id,
        isRead: false
      });
    } catch (error) {
      console.log("Notification model not available");
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: "Login Successful",
      token,
      user
    });

  } catch (error) {
    res.status(500).json({ message: "Login Failed", error });
  }
};



// GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // hide password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

function generateNameReferral(name) {
  const prefix = name.substring(0, 4).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 90000);
  return `${prefix}${random}`;
}



exports.getReferralCode = async (req, res) => {
  try {
    const userId = req.userId; // token middleware

    if (!userId)
      return res.status(400).json({ message: "User ID missing" });

    const user = await User.findById(userId).select("referralCode name");

    if (!user)
      return res.status(404).json({ message: "User not found" });

    return res.json({
      success: true,
      referralCode: user.referralCode,
      shareMessage: `Use my referral code ${user.referralCode} to sign up and earn rewards!`
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};


exports.editProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, userName, phoneNumber, email } = req.body;

    let updateData = {
      name: name,
      userName: userName,
      phoneNumber: phoneNumber,
      email: email
    };

    // If user uploads an image
    if (req.file) {
      updateData.profileImageUrl = `/upload_profile/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({ message: "Profile update failed", error });
  }
};


exports.gethomedash = async (req, res) => {
  try {
    const homeDash = await UploadImageScheme.find({ status: true, tag: "dashboard" })
    const today = new Date();
    const availableOffer = await Offer.find({
      status: true,
      validTill: { $gte: today }   // validTill >= current date
    });
    res.status(200).json({
      message: "Home Dash  successfully getting",
      homeDash: homeDash,
      availableOffer: availableOffer,
    });

  } catch (error) {
    res.status(500).json({ message: "Profile update failed", error });
  }
};


exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP for security
    // const hashedOtp = await bcrypt.hash(otp, 10);

    // Save OTP + expiry (5 min
    user.otp = otp;
    user.otpExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    // Send email
    await transporter.sendMail({
      from: '"Support – LifeRich" <noreplayliferich@gmail.com>',
      to: email,
      subject: "Your OTP Code - LifeRich",
      html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
    
    <!-- Header / Company Logo -->
    <div style="text-align: center; margin-bottom: 30px;">
      <!--  <img src="https://yourcompany.com/logo.png" alt="LifeRich" style="width: 120px; height: auto;"/> -->
      <h2 style="color: #2C3E50; margin-top: 10px;">LifeRich</h2>
    </div>

    <!-- Main Content -->
    <div style="text-align: center;">
      <h3 style="color: #34495E;">Your OTP Code</h3>
      <p style="color: #555; font-size: 16px;">Use the code below to reset your password. It will expire in 15 minutes.</p>
      <div style="font-size: 32px; font-weight: bold; color: #E74C3C; margin: 20px 0;">${otp}</div>
      
      <p style="font-size: 14px; color: #999; margin-top: 20px;">
        If you did not request this, please ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #aaa;">
      &copy; ${new Date().getFullYear()} LifeRich. All rights reserved.
    </div>
  </div>
  `
    });


    res.json({ message: "OTP sent to email" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




exports.getupiMobileScheme = async (req, res) => {
  try {
    const addupiScheme = await UpiModel.find({ status: true });
    res.status(200).json({
      message: "Get Upi successfully",
      response: addupiScheme
    });

  } catch (error) {
    res.status(500).json({ message: "Get Upi Failed", error });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Direct OTP comparison
    if (user.otp !== otp || Date.now() > user.otpExpires) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash new password
    // const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// exports.resetPassword = async (req, res) => {
//   try {
//     const { email, newPassword, otp } = req.body;

//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(404).json({ message: "User not found" });

//     //const isMatch = await bcrypt.compare(otp, user.otp);
//     if (!isMatch || Date.now() > user.otpExpires)
//       return res.status(400).json({ message: "Invalid or expired OTP" });

//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     // Update password and clear OTP
//     user.password = hashedPassword;
//     user.otp = undefined;
//     user.otpExpires = undefined;
//     await user.save();

//     res.json({ message: "Password reset successfully" });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
