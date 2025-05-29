const Category = require("../models/Category");
const Course = require("../models/Course");

// handler for creation of category
exports.createCategory = async (req, res) => {
  try {
    // fetch data
    const { name, description } = req.body;

    //validation
    if (!name || !description) {
      return res.status(401).json({
        success: false,
        message: "Please enter all details",
      });
    }

    // entry in DB
    const categoryDetail = await Category.create({
      name: name,
      description: description,
    });
    console.log(categoryDetail);

    return res.status(200).json({
      success: true,
      data: categoryDetail,
      message: "category created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating Category...",
    });
  }
};

exports.showAllCategories = async (req, res) => {
  try {
    const allCategory = await Category.find(
      {},
      { name: true, description: true }
    );
    return res.status(200).json({
      success: true,
      data: allCategory,
      message: "All categorys returned successfully ",
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

exports.categoryPageDetails = async (req, res) => {
  try {
    let { categoryId } = req.body;
    // console.log("ID TYEP", new Mongoose.Type.ObjectId(categoryId));

    // Get courses for the specified category
    const selectedCategory = await Category.findById(categoryId) //populate instuctor and rating and reviews from courses
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: [
          { path: "instructor" },
          { path: "ratingAndReviews" },
          // updated
          // { path: "category" },
        ],
      })
      .exec();
    // console.log(selectedCategory);
    // Handle the case when the category is not found
    if (!selectedCategory) {
      console.log("Category not found.");
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    // Handle the case when there are no courses
    if (selectedCategory.courses.length === 0) {
      console.log("No courses found for the selected category.");
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category.",
      });
    }

    const selectedCourses = selectedCategory.courses;

    // Get courses for other categories
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    }).populate({
      path: "courses",
      match: { status: "Published" },
      populate: [
        { path: "instructor" },
        { path: "ratingAndReviews" },
        // updated
        // { path: "category" },
      ],
    });
    let differentCourses = [];
    for (const category of categoriesExceptSelected) {
      differentCourses.push(...category.courses);
    }

    // Get top-selling courses across all categories
    const allCategories = await Category.find().populate({
      path: "courses",
      match: { status: "Published" },
      populate: [
        { path: "instructor" },
        { path: "ratingAndReviews" },
        // updated
        // { path: "category" },
      ],
    });
    const allCourses = allCategories.flatMap((category) => category.courses);
    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);

    res.status(200).json({
      selectedCourses: selectedCourses,
      differentCourses: differentCourses,
      mostSellingCourses: mostSellingCourses,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//add course to category
exports.addCourseToCategory = async (req, res) => {
  const { courseId, categoryId } = req.body;
  console.log("category id from controller", categoryId);
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }
    if (category.courses.includes(courseId)) {
      return res.status(200).json({
        success: true,
        message: "Course already exists in the category",
      });
    }
    category.courses.push(courseId);
    await category.save();
    return res.status(200).json({
      success: true,
      message: "Course added to category successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
