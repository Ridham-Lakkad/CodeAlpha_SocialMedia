import multer from "multer";

const storage = multer.memoryStorage();

const mediaFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
    return;
  }

  cb(new Error("Only image and video uploads are allowed"), false);
};

export const upload = multer({
  storage,
  fileFilter: mediaFileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024
  }
});
