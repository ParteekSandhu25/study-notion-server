const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { passwordUpdated } = require("../mail/template/passwordUpdate");
const mailSender = require("../utils/mailSender");
require("dotenv").config();

// OTP Send   --- DONE
exports.sendOTP = async (req, res) => {
  try {
    console.log("Sending OTP");
    // fetch email from request ki body
    const { email } = req.body;

    //check if user already exist
    const checkUserPresent = await User.findOne({ email });

    // if user already exist, then return a response
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already registered",
      });
    }

    // generated OTP
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP generated...");

    // check unique OTP or not
    const result = await OTP.findOne({ otp: otp });

    // NOTE: THIS IS A BAD PRACTISE USE RATHER ANOTHER LIBRARY WHICH WILL GUARANTEE YOU UNIQUE OPT EVERY TIME...
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    // opt;
    const otpPayload = { email, otp };

    // create an entry in DB for OTP
    const otpBody = await OTP.create(otpPayload);
    console.log("OTP body: ", otpBody);

    res.status(200).json({
      success: true,
      message: `OTP sent successfully`,
      otp,
    });
  } catch (error) {
    console.log("Error in sending OTP for signup : ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// signup
exports.signup = async (req, res) => {
  try {
    // data fetch from request ki body

    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;
    // validate karo user ko
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      console.log(firstName, lastName, email, password, confirmPassword, otp);
      return res.status(403).json({
        success: false,
        message: "All fields are required.   ",
      });
    }
    // 2 password ko match karo
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and ConfirmPassword value doesn't match, please try again ",
      });
    }
    //check user already exist or not
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered, try Login",
      });
    }

    //find most recent OTP stored for the user
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOtp);
    // validate the OTP
    if (recentOtp.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP not found ",
      });
    } else if (otp !== recentOtp[0].otp) {
      return res.status(400).json({
        success: false,
        message: "OTP doesn't match",
      });
    }

    //Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Create User
    let approved = "";
    approved === "Instructor" ? (approved = false) : (approved = true);

    //entry create in DB
    const ProfileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      // contactNumber,
      password: hashedPassword,
      accountType: accountType,
      approved: approved,
      additionalDetails: ProfileDetails._id,
      image: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    //return res
    return res.status(200).json({
      success: true,
      message: "User is registered Successfully",
      user,
    });
  } catch (error) {
    console.log("Error in Sign up : ", error);
    return res.status(500).json({
      success: false,
      message: "User can't be registered, Please try again",
    });
  }
};

// login
exports.login = async (req, res) => {
  try {
    // get data from user ki body
    const { email, password } = req.body;

    // validate data
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required...",
      });
    }

    // user check exist or not
    const existingUser = await User.findOne({ email })
      .populate("additionalDetails")
      .exec();

    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "User is not registered, please Create your account",
      });
    }

    // generate jwt, after matching password
    const payload = {
      email: existingUser.email,
      id: existingUser.id,
      accountType: existingUser.accountType,
    };

    // testing

    console.log(password, existingUser.password);

    bcrypt.compare(password, existingUser.password, function (err, result) {
      if (err) {
        // handle error
        res.status(403).json({
          suceess: false,
          message: "Error while compare the password and hashedPassword",
        });
      }
      if (result) {
        // Send JWT
        console.log("Password Mathes....");
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "10h",
        });

        existingUser.token = token;
        existingUser.password = undefined;

        const options = {
          expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          httpOnly: true,
        };

        // create cookie and send response
        res.cookie("token", token, options).status(200).json({
          data: existingUser,
          success: true,
          message: "User Logged In successfully...",
        });
      } else {
        // response is OutgoingMessage object that server response http request
        return res.status(403).json({
          success: false,
          message: "passwords do not match",
        });
      }
    });

    // if (bcrypt.compare(password, existingUser.password)) {
    //   console.log("Password Mathes....");
    //   const token = jwt.sign(payload, process.env.JWT_SECRET, {
    //     expiresIn: "2h",
    //   });

    //   existingUser.token = token;
    //   existingUser.password = undefined;

    //   const options = {
    //     expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    //     httpOnly: true,
    //   };

    //   // create cookie and send response
    //   res.cookie("token", token, options).status(200).json({
    //     data: existingUser,
    //     success: true,
    //     message: "User Logged In successfully...",
    //   });
    // } else {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Password Incorrect",
    //   });
    // }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Login Failure, please try again....",
    });
  }
};

//change Password
exports.changePassword = async (req, res) => {
  try {
    // fetch details from the request
    const { email, oldPassword, newPassword, confirmNewPassword } = req.body;

    // get oldPassword, newPassword, confirmNewPassword form the req.

    // apply proper validation
    if (newPassword !== confirmNewPassword) {
      return res.status(401).json({
        success: true,
        message: "New Password and confirm new password don't matches",
      });
    }
    if (oldPassword === newPassword) {
      return res.status(401).json({
        success: true,
        message: "New Password can't be same as old Password!!!",
      });
    }
    // hash the new Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // update pwd in db
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    //send mail - Password updated successfully
    await mailSender(
      email,
      "Password Updated Successfully",
      passwordUpdated(email, updatedUser.firstName)
    );

    // return response
    return res.status(200).json({
      success: true,
      // user: updatedUser,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: true,
      message: "Error in Changing Password...",
    });
  }
};
