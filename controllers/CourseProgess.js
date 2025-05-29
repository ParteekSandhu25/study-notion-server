const SubSection = require("../models/SubSection");
const CourseProgress = require("../models/CourseProgress");

exports.updateCourseProgress = async (req, res) => {
  const { courseId, subSectionId } = req.body;
  const userId = req.user.id;

  try {
    const subSection = await SubSection.findById(subSectionId);

    if (!subSection) {
      return res.status(404).json({ error: "Invalid SubSection" });
    }

    // check for old Entry
    let courseProgress = await CourseProgress.findOne({
      courseId: courseId,
      userId: userId,
    });
    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: "Course Progress doesn't exist",
      });
    } else {
      // check for re-completing video or subsection
      if (courseProgress.completedVideos.includes(subSectionId)) {
        return res.status(400).json({
          error: "SubSection already completed",
        });
      }

      // push into completed videos
      CourseProgress.completedVideos.push(subSectionId);
    }
    await CourseProgress.save();

    return res.status(200).json({
      success: true,
      message: "Lecture Completed",
    });
  } catch (error) {
    console.log("Error while marking courseProgress");
    return res.status(400).json({
      suceess: false,
      message: "Error while marking courseProgress",
    });
  }
};
