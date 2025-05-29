const { passwordUpdated } = require("../mail/template/passwordUpdate");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
// const passwordUpdate from "../mail/template/passwordUpdate.js"

// reset password TOKEN
exports.resetPasswordToken = async (req, res) => {
  try {
    // get email from the req body
    const { email } = req.body;

    //check user for the email, email validation
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Your email is not registered with use",
      });
    }

    // generate token
    const token = crypto.randomUUID();

    // update user by adding token and expiration time\
    const updatedDetials = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );
    // create url
    const url = `http://localhost:3000/update-password/${token}`;

    // send mail containing the url
    await mailSender(
      email,
      "Password Reset Link",
      `Passowrd reset Link: ${url}`
    );
    // return response
    return res.json({
      success: true,
      message:
        "Email sent successfully, please check email and change password",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong in reset PasswordToken",
    });
  }
};

// reset password
exports.resetPassword = async (req, res) => {
  try {
    // date fetch
    const { password, confirmPassword, token } = req.body;

    // validate

    if (password !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "pasword and confirm password aren't equal",
      });
    }
    // get userDetails from db using token
    const userDetails = await User.findOne({ token });

    // if no entry - invalid token
    if (!userDetails) {
      return res.status(401).json({
        success: false,
        message: "Token Invalid",
      });
    }
    // check token time
    if (!(userDetails.resetPasswordExpires > Date.now())) {
      return res.status(403).json({
        success: false,
        message: "TOken has expired, please regenerate your token  ",
      });
    }
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // update the password in db
    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );

    const mailResponse = await mailSender(
      userDetails.email,
      "Email from StudyNotion",
      passwordUpdated(userDetails.email, userDetails.firstName)
    );

    // return res
    return res.status(200).json({
      success: true,
      message: "Password Reseted Successfully...",
      // password: password,
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: "Something went wrong while reseting password",
    });
  }
};
