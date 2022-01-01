const express = require("express");
const { userLogIn } = require("../controllers/userLogIn");
const router = express.Router();

router.post("/", userLogIn);

module.exports = router;
