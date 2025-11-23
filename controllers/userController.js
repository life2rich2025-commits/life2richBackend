const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, "MY_SECRET_KEY", { expiresIn: "30d" });
};


// Register User
exports.registerUser = async (req, res) => {
  try {
    const { name, userName,email, password,confirmPassword, phoneNumber ,referralCode} = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        name,
        userName,
        email,
        password: password,
        confirmPassword:"",
        phoneNumber,
        profileImageUrl: "",
        ewalletAmount:"0",
        rewards: "0",
        referral: "0",
        referralCode: generateNameReferral(name),
        frdReferralCode:""
        });


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
    const { userName, password } = req.body;

    const user = await User.findOne({ userName });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    if (password !== user.password) {
    return res.status(401).json({ message: "Incorrect Password" });
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
    const { name, userName, phoneNumber } = req.body;

    let updateData = {
      name,
      userName,
      phoneNumber
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
