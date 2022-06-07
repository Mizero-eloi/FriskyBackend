const express = require("express");
const auth = require("../middleware/auth");
const { 
    getAllUsers,
    searchUser, 
    follow,
    unFollow,
    getAllParticipatedInChallenges} = require("../controllers/userController");
const router = express.Router();

router.get("/", getAllUsers);
router.post(
    "/searchUser", 
    auth, 
    searchUser
);
router.post(
    "/follow", 
    auth, 
    follow);
router.post(
    "/unFollow", 
    auth, 
    unFollow);

router.post(
    "/getAllParticipatedInChallenges", 
    auth, 
    getAllParticipatedInChallenges
);

module.exports = router;
