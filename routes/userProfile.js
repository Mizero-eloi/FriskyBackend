const express = require("express");
const multer = require("multer");
const {
  userProfile,
  updateUserProfilePicture,
} = require("../controllers/userProfileController");
const validateParameterId = require("../middleware/validateParameterId");
const router = express.Router();

const Imagestorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./ImageUploads");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "_") + file.originalname);
  },
});

const ImageFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    return cb(null, true);
  }
  cb(null, false);
};

const imageUpload = multer({
  storage: Imagestorage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MBs
  },
  fileFilter: ImageFilter,
});

router.post("/:userId", validateParameterId("userId"), userProfile);

router.post(
  "/profilePicture/:userId",
  validateParameterId("userId"),
  imageUpload.single("profilePicture"),
  updateUserProfilePicture
);

module.exports = router;
