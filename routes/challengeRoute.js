const express = require("express");
const auth = require("../middleware/auth");
const multer = require("multer");
const {
  uploadChallengeCoverPhoto,
  joinChallenge,
  challengeSomeone,
  unJoinChallenge,
  acceptChallenge,
  createChallenge,
  addVideoToChallenge,
  vote,
  removeVote,
  comment,
  removeComment,
  getAllComments,
  removeVideoFromChallenge,
  getAllChallenges,
  getOneChallenge,
  deleteChallenge,
} = require("../controllers/challengeController");

const validateParameterId = require("../middleware/validateParameterId");

// configuring multer and indicating the destination folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "_") + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(mp4|MPEG-4|mkv|WebM|OGG)$/)) {
    return cb(null, false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 20, // 20 MBs
  },
  fileFilter,
});

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

const router = express.Router();

router.post(
  "/comment/:challengeId",
  auth,
  validateParameterId("challengeId"),
  comment
);

router.post(
  "/removeComment/:challengeId",
  auth,
  validateParameterId("challengeId"),
  removeComment
);

router.post(
  "/vote/:challengeId",
  auth,
  validateParameterId("challengeId"),
  vote
);

router.post(
  "/removeVote/:challengeId",
  auth,
  validateParameterId("challengeId"),
  removeVote
);

router.post(
  "/challengeSomeone",
  auth,
  upload.single("challengeVideo"),
  challengeSomeone
);
router.post("/", auth, upload.single("challengeVideo"), createChallenge);
// Route to get all challenges
router.get("/", getAllChallenges);
// Route to get one challenge
router.get(
  "/:challengeId",
  validateParameterId("challengeId"),
  getOneChallenge
);
// Route to delete challenge
router.delete(
  "/:challengeId",
  validateParameterId("challengeId"),
  deleteChallenge
);

router.post(
  "/addVideotoChallenge/:challengeId",
  auth,
  validateParameterId("challengeId"),
  upload.single("challengeVideo"),
  addVideoToChallenge
);

router.post(
  "/removeVideoFromChallenge/:challengeId",
  auth,
  validateParameterId("challengeId"),
  removeVideoFromChallenge
);

router.post(
  "/uploadChallengeCoverphoto/:challengeId",
  auth,
  validateParameterId("challengeId"),
  imageUpload.single("coverPhoto"),
  uploadChallengeCoverPhoto
);

router.post(
  "/joinChallenge/:challengeId",
  auth,
  validateParameterId("challengeId"),
  upload.single("challengeVideo"),
  joinChallenge
);

router.get(
  "/unjoinChallenge/:challengeId",
  auth,
  validateParameterId("challengeId"),
  unJoinChallenge
);

router.get(
  "/acceptChallenge/:challengeId",
  auth,
  validateParameterId("challengeId"),
  acceptChallenge
);

router.get(
  "/getAllComments/:challengeId",
  validateParameterId("challengeId"),
  getAllComments
);

module.exports = router;
