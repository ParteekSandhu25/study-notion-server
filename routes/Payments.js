// Import the required modules
const express = require("express");
const router = express.Router();
const {
  capturePayment,
  verifySignature,
  sendPaymentSuccessEmail,
  verifyPayment,
} = require("../controllers/Payments");
const {
  auth,
  isInstructor,
  isStudent,
  isAdmin,
} = require("../middlewares/auth");

router.post("/capturePayment", auth, isStudent, capturePayment);
router.post("/verifyPayment", auth, isStudent, verifySignature);
router.post("/sendPaymentSuccessEmail", auth, sendPaymentSuccessEmail);
// router.post("/capturePayment", auth, isStudent, capturePayment);
// router.post("/verifyPayment", auth, isStudent, verifyPayment);
// router.post("/sendPaymentSuccessEmail", auth, sendPaymentSuccessEmail);

module.exports = router;
