const express = require("express");
const { userRegistration} = require("../controllers/userRegistration");
const router = express.Router();

router.post("/", userRegistration);


module.exports = router;
