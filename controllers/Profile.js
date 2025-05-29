const Profile = require("../models/Profile");
const Course = require("../models/Course");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

exports.updateProfile = async (req, res) => {
  try {
    // get data
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;

    // get user ID from req
    const id = req.user.id;

    console.log(dateOfBirth, about, contactNumber, gender);

    //validation
    if (!contactNumber || !gender || !id) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // find Profile
    const userDetails = await User.findById(id);
    const profileId = userDetails.additionalDetails;

    const ProfileDetails = await Profile.findById(profileId);

    // update profile
    // const updatedProfile = await Profile.findByIdAndUpdate(
    //   profileId,
    //   {
    //     $push: {
    //       dateOfBirth: dateOfBirth,
    //       about: about,
    //       gender: gender,
    //       contactNumber: contactNumber,
    //     },
    //   },
    //   { new: true }
    // );

    // or you can use Save() function to enter the data in DB
    ProfileDetails.dateOfBirth = dateOfBirth;
    ProfileDetails.gender = gender;
    ProfileDetails.contactNumber = contactNumber;
    ProfileDetails.about = about;

    await ProfileDetails.save();

    //return response
    return res.status(200).json({
      success: true,
      message: "User Profile Updated successfully",
      ProfileDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Error in updating the user profile",
    });
  }
};

// delete Account
exports.deleteAccount = async (req, res) => {
  try {
    // TODO: Find more on Job Schedule
    // const job = schedule.scheduleJob("10 * * * * * ", function () ) {
    //   console.log("The anser to life, the universe, and everything.")
    // }
    // console.log(job);

    // get id
    const userId = req.user.id;

    // check if id is valid ?
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // delete profile
    const profileId = existingUser.additionalDetails;
    await Profile.findByIdAndDelete(profileId);
    // TODO HM: unenroll user from all enrolled courses

    // delete user
    await User.findByIdAndDelete(userId);

    // return res
    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Error in deleting account",
    });
  }
};

exports.getAllUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const userDetails = await User.findById(userId)
      .populate("additionalDetails")
      .exec();

    return res.status(200).json({
      success: true,
      data: userDetails,
      message: "User Detail fetched successfully",
    });
  } catch (error) {
    console.log(error.message, error);
    return res.status(400).json({
      success: false,
      message: "Error in getAllUserDetails account",
    });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const enrolledCourses = await User.findById(id)
      .populate([
        {
          path: "courses",
          populate: {
            path: "courseContent",
            populate: {
              path: "subSection",
            },
          },
        },
        {
          path: "courseProgress",
          populate: { path: "completedVideos" },
        },
      ])
      .exec();

    console.log(enrolledCourses);
    res.status(200).json({
      success: true,
      message: "User Data fetched successfully",
      data: enrolledCourses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//updateDisplayPicture
exports.updateDisplayPicture = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const image = req.files.pfp;
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }
    const uploadDetails = await uploadImageToCloudinary(
      image,
      process.env.FOLDER_NAME
    );
    console.log(uploadDetails);

    const updatedImage = await User.findByIdAndUpdate(
      { _id: id },
      { image: uploadDetails.secure_url },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Image updated successfully",
      data: updatedImage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in uploadProfilePicture function",
      error: error.message,
    });
  }
};

//instructor dashboard
exports.instructorDashboard = async (req, res) => {
  try {
    const id = req.user.id;
    const courseData = await Course.find({ instructor: id });
    const courseDetails = courseData.map((course) => {
      const totalStudents = course?.studentsEnrolled?.length;
      const totalRevenue = course?.price * totalStudents;
      const courseStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        totalStudents,
        totalRevenue,
      };
      return courseStats;
    });
    res.status(200).json({
      success: true,
      message: "User Data fetched successfully",
      data: courseDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
