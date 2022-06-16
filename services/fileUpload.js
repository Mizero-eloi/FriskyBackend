const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

class FileUpload {
  static storage;

  constructor() {
    this.storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: "FRISKY",
      },
    });
  }
}

class ImageUpload extends FileUpload {
  constructor() {
    super();
    this.imageFilter = (req, file, cb) => {
      if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg"
      ) {
        return cb(null, true);
      }
      cb(null, false);
    };

    this.imageSize = 1024 * 1024 * 5; // 5 MBs
    this.upload = multer({
      storage: this.storage,
      limits: {
        fileSize: 1024 * 1024 * 20, // 20 MBs
      },
      fileFilter: this.imageFilter,
    });
  }
}

class VideoUpload extends FileUpload {
  constructor() {
    super();
    this.fileFilter = (req, file, cb) => {
      if (!file.originalname.match(/\.(mp4|MPEG-4|mkv|WebM|OGG)$/)) {
        return cb(null, false);
      }
      cb(null, true);
    };
    (this.fileSize = 1024 * 1024 * 20), // 20 MBs;
      (this.upload = multer({
        storage: this.storage,
        limits: {
          fileSize: this.fileSize,
        },
        fileFilter: this.fileFilter,
      }));
  }
}

module.exports.ImageUpload = ImageUpload;
module.exports.VideoUpload = VideoUpload;
