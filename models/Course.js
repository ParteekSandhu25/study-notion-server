const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    trim: true,
    required: true,
  },
  courseDescription: {
    type: String,
    trim: true,
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  whatYouWillLearn: {
    type: String,
    trim: true,
    required: true,
  },
  courseContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
  ],
  ratingAndReviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReview",
      required: true,
    },
  ],
  price: {
    type: Number,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  tag: {
    type: [String],
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    // required: true,
  },
  studentsEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  instructions: {
    type: [String],
  },
  status: {
    type: String,
    enum: ["Draft", "Published"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Course", courseSchema);

// const mongoose = require("mongoose");

// // Define the Courses schema
// const courseSchema = new mongoose.Schema(
//   {
//     courseName: { type: String },
//     courseDescription: { type: String },
//     instructor: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       ref: "User",
//     },
//     whatYouWillLearn: {
//       type: String,
//     },
//     courseContent: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Section",
//       },
//     ],
//     ratingAndReviews: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "RatingAndReview",
//       },
//     ],
//     price: {
//       type: Number,
//     },
//     thumbnail: {
//       type: String,
//     },
//     tag: {
//       type: [String],
//       required: true,
//     },
//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       // required: true,
//       ref: "Category",
//     },
//     studentsEnrolled: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true,
//         ref: "user",
//       },
//     ],
//     instructions: {
//       type: [String],
//     },
//     status: {
//       type: String,
//       enum: ["Draft", "Published"],
//     },
//   },
//   { timestamps: true }
// );

// // Export the Courses model
// module.exports = mongoose.model("Course", courseSchema);
