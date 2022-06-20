const express = require("express");
const auth = require("../middleware/auth");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
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
  trendingStar,
  getAllParticipants
} = require("../controllers/challengeController");

const validateParameterId = require("../middleware/validateParameterId");
const { uploadFile } = require("../services/fileUpload");
const uploadVideos = uploadFile();

const router = express.Router();

router.get(
  "/trendingStar",
  auth,
  trendingStar
);

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
  uploadVideos.single("challengeVideo"),
  challengeSomeone
);
router.post(
  "/",
  auth,
  uploadVideos.single("challengeVideo"),
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
  uploadVideos.single("challengeVideo"),
  addVideoToChallenge
);

router.post(
  "/removeVideoFromChallenge/:challengeId",
  auth,
  validateParameterId("challengeId"),
  removeVideoFromChallenge
);




// **************** logic to store image to cloudinary *****************


cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ChallengeCoverPhotos",
  },
});

const uploadChallengeCover = multer({ storage: storage });


// ************************** end logic to store image to cloudinary *************************




router.post(
  "/uploadChallengeCoverphoto/:challengeId",
  auth,
  validateParameterId("challengeId"),
  uploadChallengeCover.single("coverPhoto"),
  uploadChallengeCoverPhoto
);

router.post(
  "/joinChallenge/:challengeId",
  auth,
  validateParameterId("challengeId"),  
  uploadVideos.single("challengeVideo"),
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

router.post("/getAllParticipants/:challengeId",
  validateParameterId("challengeId"),
  getAllParticipants
)





module.exports = router;
