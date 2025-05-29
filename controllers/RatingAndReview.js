const RatingAndReview = require("../models/RatingAndReview");
const User = require("../models/User");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

// createRating
exports.createRating = async (req, res) => {
  try {
    // get user id
    const userId = req.user.id;

    // fetch data from user ki body
    const { rating, review, courseId } = req.body;

    // check if user is enrolled or not
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Student is not enrolled in the course",
      });
    }

    // check if already reviewed the course
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });

    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Course is already reviewed by the user",
      });
    }

    //create review and rating
    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });

    //  update course with  this rating/review
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: { RatingAndReview: ratingReview._id },
      },
      { new: true }
    );

    console.log(updatedCourseDetails);

    // return response
    return res.status(200).json({
      success: true,
      message: "Rating and reviews added successfully",
      ratingReview,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error while creating rating and review",
      error: error.message,
    });
  }
};

// getAverageRating
exports.getAverageRating = async (req, res) => {
  try {
    // get course ID
    const { courseId } = req.body;

    // calculate average rating
    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    // return rating
    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: result[0].averageRating,
      });
    }

    // if no rating are given
    return res.status(200).json({
      success: true,
      message: "Average rating is 0, no rating are given till now.",
      averageRating: 0,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while getting average rating ",
      error: error.message,
    });
  }
};

//getAllRating
exports.getAllRating = async (req, res) => {
  try {
    const allReview = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "All review fetched successfully",
      data: allReview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while getting all reviews and ratings ",
      error: error.message,
    });
  }
};

// HW: make a function which returns all ratingAndReview for a specific course
exports.getCourseRating = async (req, res) => {
  const { courseId } = req.body;
  try {
    if (!courseId) {
      return res.status(403).json({
        success: false,
        message: "Please provide the courseID...",
      });
    }

    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
    ]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No reviews are for this course ${courseId}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
      message: "All reviews and rating fetched successfully....",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error while getting reviews and ratings of course: ${courseId} `,
      error: error.message,
    });
  }
};
