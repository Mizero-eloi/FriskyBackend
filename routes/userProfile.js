const express = require("express");
const multer = require("multer");
const {
  userProfile,
  updateUserProfilePicture,
} = require("../controllers/userProfileController");
const validateParameterId = require("../middleware/validateParameterId");
const { ImageUpload } = require("../services/fileUpload");
const router = express.Router();

const imageUpload = new ImageUpload();

router.post("/:userId", validateParameterId("userId"), userProfile);

router.post(
  "/profilePicture/:userId",
  validateParameterId("userId"),
  imageUpload.upload.single("profilePicture"),
  updateUserProfilePicture
);

module.exports = router;
