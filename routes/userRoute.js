const express = require("express");
const auth = require("../middleware/auth");
const { 
    getAllUsers,
    searchUser, 
    follow,
    unFollow} = require("../controllers/userController");
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

module.exports = router;
