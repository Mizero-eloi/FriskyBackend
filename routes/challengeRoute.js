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
  searchChallenge,
  Winner,
} = require("../controllers/challengeController");

const validateParameterId = require("../middleware/validateParameterId");
const { ImageUpload, VideoUpload } = require("../services/fileUpload");

const imageUpload = new ImageUpload();
const videoUpload = new VideoUpload();

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
  videoUpload.upload.single("challengeVideo"),
  challengeSomeone
);
router.post(
  "/",
  auth,
  videoUpload.upload.single("challengeVideo"),
  createChallenge
);
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
  videoUpload.upload.single("challengeVideo"),
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
  imageUpload.upload.single("coverPhoto"),
  uploadChallengeCoverPhoto
);

router.post(
  "/joinChallenge/:challengeId",
  auth,
  validateParameterId("challengeId"),
  videoUpload.upload.single("challengeVideo"),
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

router.post(
  "/searchChallenge", 
  auth, 
  searchChallenge
);

router.post(
  "/Winner/:challengeId",
  validateParameterId("challengeId"),
  Winner
);

module.exports = router;
