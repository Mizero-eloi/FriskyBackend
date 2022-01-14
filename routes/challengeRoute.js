const express = require("express");
const multer  =  require("multer");
const { makeChallenge, postChallengeVideoWhileMakingChallenge, uploadChallengeCoverPhoto, joinChallenge } = require("../controllers/challengeController");
const validateParameterId = require("../middleware/validateParameterId");

// configuring multer and indicating the destination folder
const storage = multer.diskStorage({
    destination: function (req, file, cb){ 
        cb(null, './uploads');
    },
    filename: function (req, file, cb){
        cb(null,new Date().toISOString().replace(/:/g, "_") + file.originalname);
    }
})

const fileFilter = (req, file, cb) =>{
    if(!file.originalname.match(/\.(mp4|MPEG-4|mkv|WebM|OGG)$/)){
        return cb(null, false);
    }
    cb(null, true)
    
}



const upload = multer({storage, limits: {
    fileSize: 1024 * 1024 * 20 // 20 MBs
}, fileFilter});


const Imagestorage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, './ImageUploads');
    },
    filename: function (req, file, cb){
        cb(null,new Date().toISOString().replace(/:/g, "_") + file.originalname);
    }
})

const ImageFilter = (req, file, cb) =>{
        if(file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg" ){
           return cb(null, true);
        } 
        cb(null, false); 
}

const imageUpload = multer({storage: Imagestorage, limits: {
    fileSize: 1024 * 1024 * 5 // 5 MBs
}, fileFilter:ImageFilter});

const router = express.Router();

router.post("/:challengeId",validateParameterId("challengeId"), upload.single("challengeVideo"), postChallengeVideoWhileMakingChallenge);
router.post("/uploadChallengeCoverphoto/:challengeId",validateParameterId("challengeId"),imageUpload.single("coverPhoto"),uploadChallengeCoverPhoto);
router.post("/joinChallenge/:challengeId",validateParameterId("challengeId"), upload.single("challengeVideo"),joinChallenge);
router.post("/",makeChallenge);

module.exports = router;
