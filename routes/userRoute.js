const express = require("express");
const auth = require("../middleware/auth");
const { 
    getAllUsers,
    searchUser } = require("../controllers/userController");
const router = express.Router();

router.get("/", getAllUsers);
router.post(
    "/searchUser", 
    auth, 
    searchUser
);

module.exports = router;
