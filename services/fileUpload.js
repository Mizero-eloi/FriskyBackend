const { diskStorage } = require("multer");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

// class FileUpload {
//   static storage;

//   constructor() {
//     this.storage = new CloudinaryStorage({
//       cloudinary: cloudinary,
//       params: {
//         folder: "ChallengeVideos",
//       },
//     });
//   }
// }

// class ImageUpload extends FileUpload {
//   constructor() {
//     super();
//     this.imageFilter = (req, file, cb) => {
//       if (
//         file.mimetype === "image/jpeg" ||
//         file.mimetype === "image/png" ||
//         file.mimetype === "image/jpg"
//       ) {
//         return cb(null, true);
//       }
//       cb(null, false);
//     };

//     this.imageSize = 1024 * 1024 * 5; // 5 MBs
//     this.upload = multer({
//       storage: this.storage,
//       limits: {
//         fileSize: 1024 * 1024 * 20, // 20 MBs
//       },
//       fileFilter: this.imageFilter,
//     });
//   }
// }

// class VideoUpload extends FileUpload {
//   constructor() {
//     super();
//     this.fileFilter = (req, file, cb) => {
//       if (!file.originalname.match(/\.(mp4|MPEG-4|mkv|WebM|OGG)$/)) {
//         return cb(null, false);
//       }
//       cb(null, true);
//     };
//     (this.fileSize = 1024 * 1024 * 20), // 20 MBs;
//       (this.upload = multer({
//         storage: this.storage,
//         limits: {
//           fileSize: this.fileSize,
//         },
//         fileFilter: this.fileFilter,
//       }));
//   }
// }

function uploadFile(destination){
  cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
  });
  
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "ChallengeVideos",
      resource_type: 'auto',
      allowedFormats: ['mp4'],
    },
  });
    const fileFilter = (req,file,cb)=>{
        if( file.mimetype==='video/mp4'){
            cb(null,true)
        }
        else{
            cb("File Type not video",false)
        }
    }

    const upload = multer({
        storage:storage,
        limits:{
            fileSize:1024 * 1024 * 10
        },
        fileFilter: fileFilter
    })
    return upload
}

module.exports.uploadFile = uploadFile;

// module.exports.ImageUpload = ImageUpload;
// module.exports.VideoUpload = VideoUpload;