const { instance } = require("../config/razorpay");
const User = require("../models/User");
const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const mailSender = require("../utils/mailSender");
const mongoose = require("mongoose");
const {
  // courseEnrollementEmail,
  courseEnrollmentEmail,
} = require("../mail/template/courseEnrollementEmail");
const { paymentSuccess } = require("../mail/template/paymentSuccess");
const crypto = require("crypto");

// //initiate razorpay order
// exports.capturePayment = async (req, res) => {
//   const { courses } = req.body;
//   const userId = req.user.id;

//   if (courses.length === 0) {
//     return res.json({
//       success: false,
//       message: "Please provide the Course Id",
//     });
//   }

//   let totalAmount = 0;

//   for (const course_id of courses) {
//     let course;
//     try {
//       // const courseObjId = new mongoose.Types.ObjectId(course_id);
//       course = await Course.findById(course_id);
//       if (!course) {
//         return res.json({
//           success: false,
//           message: "Could not find the course",
//         });
//       }

//       const uid = new mongoose.Types.ObjectId(userId);
//       if (course.studentsEnrolled.includes(uid)) {
//         return res.json({
//           sucess: false,
//           message: "Student already enrollend in this course",
//         });
//       }

//       totalAmount += course.price;
//     } catch (error) {
//       console.log(error);
//       return res.status(500).json({ success: false, message: error.message });
//     }
//   }

//   const options = {
//     amount: totalAmount * 100,
//     currency: "INR",
//     receipt: Math.random(Date.now()).toString(),
//   };

//   // creating order
//   try {
//     const paymentResponse = await instance.orders.create(options);
//     res.json({
//       success: true,
//       message: paymentResponse,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // verify Payments
// exports.verifyPayment = async (req, res) => {
//   const razorpay_order_id = req.body?.razorpay_order_id;
//   const razorpay_payment_id = req.body?.razorpay_payment_id;
//   const razorpay_signature = req.body?.razorpay_signature;
//   const courses = req.body?.courses;
//   const userId = req.user.id;

//   if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
//     return res.status(200).json({ success: false, message: "Payment Failed" });
//   }

//   let body = razorpay_order_id + "|" + razorpay_payment_id;
//   // const expectedSignature = crypto
//   //   .creatHmac("sha256", process.env.RAZORPAY_SECRET)
//   //   .update(body.toString())
//   //   .digest("hex");

//   // if (expectedSignature === razorpay_signature) {
//   //   // enroll karwan padega student ko
//   //   await enrollStudent(courses, userId, res);
//   //   // return res
//   //   return res.status(200).json({
//   //     success: true,
//   //     message: "Payment Verified",
//   //   });
//   // }
//   try {
//     //verify the signature
//     const generatedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_SECRET)
//       .update(body.toString())
//       .digest("hex");
//     if (generatedSignature === razorpay_signature) {
//       await enrollStudent(courses, userId);
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
//   return res.status(200).json({ success: false, message: "Payment Failed" });
// };

// // enroll the student into the course and also add the student into the studentEnrolled in course
// const enrollStudent = async (courses, userId, res) => {
//   if (!courses || !userId) {
//     return res.status(400).json({
//       success: false,
//       message: "Please provide data for Courses and UserId",
//     });
//   }

//   for (const courseId of courses) {
//     try {
//       const enrolledCourse = await Course.findByIdAndUpdate(
//         { _id: courseId },
//         { $push: { studentsEnrolled: userId } },
//         { new: true }
//       );

//       if (!enrolledCourse) {
//         return res
//           .status(500)
//           .json({ success: false, message: "Courses not Found " });
//       }

//       // find the student and add the courseId of the course in the CoursId in user model
//       const studentsEnrolled = await User.findByIdAndUpdate(
//         { _id: userId },
//         { $push: { courses: courseId } },
//         { new: true }
//       );

//       // bache ko mail send kardo
//       // const emailResponse = await mailSender(
//       //   enrollStudent.email,
//       //   `Successfully Enrolled into ${enrolledCourse.courseName}`,
//       //   courseEnrollmentEmail(
//       //     enrolledCourse.courseName,
//       //     studentsEnrolled.firstName
//       //   )
//       // );

//       // console.log("Email sent successfully: ", emailResponse);
//     } catch (error) {
//       console.log(error);
//       return res.status(500).json({ success: false, message: error.message });
//     }
//   }
// };

// exports.sendPaymentSuccessEmail = async (req, res) => {
//   const { orderId, paymentId, amount } = req.body;
//   const userId = req.user.id;

//   if (!orderId || !paymentId || !amount || !userId) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Please provide all the fields" });
//   }

//   try {
//     const enrolledStudent = await User.findById(userId);
//     await mailSender(
//       enrolledStudent.email,
//       `Payment Recieved`,
//       paymentSuccess(
//         amount / 100,
//         paymentId,
//         orderId,
//         `${enrolledStudent.firstName}`,
//         `${enrolledStudent.lastName}`
//       )
//     );
//   } catch (error) {
//     console.log("Error in sending mail", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Could not send email" });
//   }
// };

//
//
//
//
//
//
//
//
//
//
//

// Down code is for buying one course at a time....

// capture the payment and initiates the Razorpay order
// exports.capturePayment = async (req, res) => {
//   //get courseId and userId
//   const { courseId } = req.body;
//   const userId = req.user.id;

//   // validation
//   // valid coursId
//   if (!courseId) {
//     return res.status(401).json({
//       success: false,
//       message: "Course ID is not valid",
//     });
//   }
//   // valid courseDetail
//   let course;
//   try {
//     course = await Course.findById(courseId);
//     if (!course) {
//       return res.status(401).json({
//         success: false,
//         message: "Could not find the course",
//       });
//     }

//     // checking if the user has already bought the course or not ?
//     const uid = new mongoose.Types.objectId(userId);
//     if (course.studentsEnrolled.includes(uid)) {
//       return res.status(200).json({
//         success: false,
//         message: "Student is already enrolled",
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
//   // order create
//   const amount = course.price;
//   const currency = "INR";

//   const options = {
//     amount: amount * 100,
//     currency: currency,
//     receipt: Math.random(Date.now()).toString(),
//     notes: {
//       // we have passed them here so that we can fetch them when we have verified signatures and use them to Update the Course and User model,
//       // in the verifySignature function the req will not contain user aur courseID because the request wasn't send by the frontend, it was send by the razorpay so, that's why we have passed these parameters here so that we can use them there...
//       courseId: courseId,
//       userId,
//     },
//   };

//   try {
//     // initiate the payment using razorpay
//     const paymentResponse = await instance.orders.create(options);
//     console.log(paymentResponse);

//     // return response
//     return res.status(200).json({
//       success: true,
//       courseName: course.courseName,
//       courseDescription: course.courseDesciption,
//       thumbnail: course.thumbnail,
//       orderId: paymentResponse.id,
//       currencey: paymentResponse.currencey,
//       amount: paymentResponse.amount,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: "Couldn't initiate order",
//     });
//   }
// };

// exports.verifySignature = async (req, res) => {
//   const webhookSecret = "12345678";

//   const signature = req.header["x-razorpay-signature"];

//   const shasum = crypto.createHmac("sha256", webhookSecret);
//   shasum.update(JSON.stringify(req.body));
//   const digest = shasum.digest("hex");

//   if (signature === digest) {
//     console.log("Payment is Authorized");

//     const { courseId, userId } = req.body.payload.entity.notes;

//     try {
//       // fulfil the action

//       // find the course and enroll the student in it
//       const enrolledCourse = await Course.findOneAndUpdate(
//         { _id: courseId },
//         { $push: { studentsEnrolled: userId } },
//         { new: true }
//       );

//       if (!enrolledCourse) {
//         return res.status(500).json({
//           success: false,
//           message: "Course not found",
//         });
//       }

//       console.log(enrolledCourse);

//       const enrolledStudent = await User.findOneAndUpdate(
//         { _id: userId },
//         { $push: { courses: courseId } },
//         { new: true }
//       );
//       console.log(enrolledStudent);

//       // mail send kardo confirmation ka
//       const emailResponse = await mailSender(
//         enrolledStudent.email,
//         "Congratulations form Study Notions",
//         "Congratulations, you are onboarded into Study Notion"
//       );

//       console.log(emailResponse);

//       return res.status(200).json({
//         success: true,
//         message: "Signature verified and course Added",
//       });
//     } catch (error) {
//       console.log(error);
//       return res.status(500).json({
//         success: false,
//         message: "Error in verifying signatures",
//       });
//     }
//   } else {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid request",
//     });
//   }
// };

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

exports.capturePayment = async (req, res) => {
  //get courseId and UserID
  const { courses } = req.body;
  const userId = req.user.id;
  //validation
  //valid courseID
  try {
    if (courses.length === 0) {
      return res.json({
        success: false,
        message: "Please provide valid course ID",
      });
    }

    let totalAmount = 0;

    for (const course_id of courses) {
      let course;
      // console.log("courseid=",course_id);
      try {
        course = await Course.findById(course_id);
        if (!course) {
          return res.json({
            success: false,
            message: "Could not find the course",
          });
        }

        //user already pay for the same course
        const uid = new mongoose.Types.ObjectId(userId);
        if (course.studentsEnrolled.includes(uid)) {
          return res.status(200).json({
            success: false,
            message: "Student is already enrolled",
          });
        }
        totalAmount += course.price;
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
      // totalAmount += course.price;
    }
    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: Math.random(Date.now()).toString(),
    };

    try {
      //initiate the payment using razorpay
      const paymentResponse = await instance.orders.create(options);
      console.log("payment", paymentResponse);
      //return response
      return res.status(200).json({
        success: true,
        orderId: paymentResponse.id,
        currency: paymentResponse.currency,
        amount: paymentResponse.amount,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//verify the signature
exports.verifySignature = async (req, res) => {
  //get the payment details
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;
  const { courses } = req.body;
  const userId = req.user.id;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: "Payment details are incomplete",
    });
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id;

  const enrolleStudent = async (courses, userId) => {
    if (!courses || !userId) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid courses and user ID",
      });
    }
    try {
      //update the course
      for (const course_id of courses) {
        console.log("verify courses=", course_id);
        const course = await Course.findByIdAndUpdate(
          course_id,
          { $push: { studentsEnrolled: userId } },
          { new: true }
        );
        //update the user
        const user = await User.updateOne(
          { _id: userId },
          { $push: { courses: course_id } },
          { new: true }
        );
        //set course progress
        const newCourseProgress = new CourseProgress({
          userID: userId,
          courseID: course_id,
          completedVideos: [],
        });
        await newCourseProgress.save();

        //add new course progress to user
        await User.findByIdAndUpdate(
          userId,
          {
            $push: { courseProgress: newCourseProgress._id },
          },
          { new: true }
        );
        //send email
        const recipient = await User.findById(userId);
        console.log("recipient=>", course);
        const courseName = course.courseName;
        const courseDescription = course.courseDescription;
        const thumbnail = course.thumbnail;
        const userEmail = recipient.email;
        const userName = recipient.firstName + " " + recipient.lastName;
        const emailTemplate = courseEnrollmentEmail(
          courseName,
          userName,
          courseDescription,
          thumbnail
        );
        await mailSender(
          userEmail,
          `You have successfully enrolled for ${courseName}`,
          emailTemplate
        );
      }
      return res.status(200).json({
        success: true,
        message: "Payment successful",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  try {
    //verify the signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");
    if (generatedSignature === razorpay_signature) {
      await enrolleStudent(courses, userId);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//send email

exports.sendPaymentSuccessEmail = async (req, res) => {
  const { amount, paymentId, orderId } = req.body;
  const userId = req.user.id;
  if (!amount || !paymentId) {
    return res.status(400).json({
      success: false,
      message: "Please provide valid payment details",
    });
  }
  try {
    const enrolledStudent = await User.findById(userId);
    await mailSender(
      enrolledStudent.email,
      `Study Notion Payment successful`,
      paymentSuccess(
        amount / 100,
        paymentId,
        orderId,
        enrolledStudent.firstName,
        enrolledStudent.lastName
      )
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
