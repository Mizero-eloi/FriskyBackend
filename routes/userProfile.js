const express = require("express");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const auth = require("../middleware/auth");
const multer = require("multer");
require('dotenv').config();

const {
  userProfile,
  updateUserProfilePicture,
} = require("../controllers/userProfileController");

const validateParameterId = require("../middleware/validateParameterId");
const router = express.Router();



// **************** logic to store image to cloudinary *****************


cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ProfilePictures",
  },
});

const upload = multer({ storage: storage });


// ************************** end logic to store image to cloudinary *************************



router.post(
  "/:userId", 
  validateParameterId("userId"),
  auth, 
  userProfile);

router.post(
  "/profilePicture/:userId",
  auth,
  validateParameterId("userId"),
  upload.single("profilePicture"),
  updateUserProfilePicture
);

module.exports = router;
