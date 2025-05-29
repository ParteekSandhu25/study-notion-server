const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");

exports.createSection = async (req, res) => {
  try {
    // data fetch
    const { sectionName, courseId } = req.body;
    // validate
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Please enter all fields...",
      });
    }
    // create section
    const newSection = await Section.create({ sectionName });
    // update course with section ObjectID
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      { $push: { courseContent: newSection._id } },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    // .populate("Section")
    // HW: use populate to replace "Section & sub-section" both in the updatedCourseDetails

    // return response
    return res.status(200).json({
      success: true,
      updatedCourseDetails,
      message: "Section created successfully..",
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: "Something went wrong while creating a section...",
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    //data input
    const { sectionName, sectionId, courseId } = req.body;

    // data validation
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Please enter all fields...",
      });
    }

    // testing
    const sectionDetails = await Section.findById(sectionId);
    if (!sectionDetails) {
      return res.status(404).json({
        success: false,
        message: "Section not found ",
      });
    }

    // update data
    // eslint-disable-next-line no-unused-vars
    const updatedCourseDetails = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        sectionName: sectionName,
      },
      { new: true }
    );

    const course = await Course.findById(courseId).populate({
      path: "courseContent",
      populate: {
        path: "subSection",
      },
    });

    // return res
    return res.status(200).json({
      success: true,
      data: course,
      message: "Section Updated successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: "Something went wrong while updating a section...",
      error: error.message,
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.body;
    await Course.findByIdAndUpdate(courseId, {
      $pull: { courseContent: sectionId },
    });

    const section = await Section.findById(sectionId);
    console.log(sectionId, courseId);
    if (!section) {
      return res.status(400).json({
        success: false,
        message: "Section was not found",
      });
    }

    // delete sub section
    await SubSection.deleteMany({ _id: { $in: section.subSection } });

    await Section.findByIdAndDelete(sectionId);

    // find the updated course and return
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      })
      .exec();

    res.status(200).json({
      success: true,
      message: "Section Deleted Successfully",
      data: course,
    });
  } catch (error) {
    console.error("Error deleting section:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
