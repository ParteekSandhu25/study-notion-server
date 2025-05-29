const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const Course = require("../models/Course");
require("dotenv").config();

exports.createSubSection = async (req, res) => {
  try {
    // fetch data from req body
    const { sectionId, title, description, courseId } = req.body;

    //  extract file/ vide
    const video = req.files.videoFile;

    // validate
    if (!sectionId || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "Please enter all fields...",
      });
    }

    // upload video to cloudinary & fetch secure_url
    const uploadDetail = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    // create a SubSection
    const subSectionDetail = await SubSection.create({
      title: title,
      // timeDuration: timeDuration,
      description: description,
      videoUrl: uploadDetail.secure_url,
    });

    // update Section with the ObjectID of SubSection
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      {
        $push: { subSection: subSectionDetail._id },
      },
      { new: true }
    );

    const course = await Course.findById(courseId)
      .populate({ path: "courseContent", populate: { path: "subSection" } })
      .exec();

    // HW: log updated section here, after reading popoulate query

    //return res
    return res.status(200).json({
      success: true,
      message: "SubSection created successfully",
      data: course,
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateSubSection = async (req, res) => {
  try {
    // Extract necessary information from the request body
    const { SubsectionId, title, description, courseId } = req.body;
    const video = req?.files?.videoFile;

    let uploadDetails = null;
    // Upload the video file to Cloudinary
    if (video) {
      uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_VIDEO
      );
    }

    // Create a new sub-section with the necessary information
    const SubSectionDetails = await SubSection.findByIdAndUpdate(
      { _id: SubsectionId },
      {
        title: title || SubSection.title,
        // timeDuration: timeDuration,
        description: description || SubSection.description,
        videoUrl: uploadDetails?.secure_url || SubSection.videoUrl,
      },
      { new: true }
    );

    const updatedCourse = await Course.findById(courseId)
      .populate({ path: "courseContent", populate: { path: "subSection" } })
      .exec();
    // Return the updated section in the response
    return res.status(200).json({ success: true, data: updatedCourse });
  } catch (error) {
    // Handle any errors that may occur during the process
    console.error("Error creating new sub-section:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, courseId } = req.body;
    const sectionId = req.body.sectionId;
    if (!subSectionId || !sectionId) {
      return res.status(404).json({
        success: false,
        message: "all fields are required",
      });
    }
    const ifsubSection = await SubSection.findById({ _id: subSectionId });
    const ifsection = await Section.findById({ _id: sectionId });
    if (!ifsubSection) {
      return res.status(404).json({
        success: false,
        message: "Sub-section not found",
      });
    }
    if (!ifsection) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }
    await SubSection.findByIdAndDelete(subSectionId);
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      { $pull: { subSection: subSectionId } },
      { new: true }
    );
    // const updatedCourse = await Course.findById(courseId)
    //   .populate({ path: "courseContent", populate: { path: "subSection" } })
    //   .exec();
    const updatedSection = await Section.findById(sectionId)
      .populate("subSection")
      .exec();

    const course = await Course.findById(courseId)
      .populate({ path: "courseContent", populate: { path: "subSection" } })
      .exec();

    return res.status(200).json({
      success: true,
      message: "Sub-section deleted",
      data: course,
    });
  } catch (error) {
    // Handle any errors that may occur during the process
    console.error("Error deleting sub-section:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
