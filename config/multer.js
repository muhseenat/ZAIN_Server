const multer = require("multer");

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const filter = (req, file, cb) => {
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
    cb(null, true);
  } else {
    cb({ message: "This file format is not supported" }, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: filter,
});

module.exports = upload;
