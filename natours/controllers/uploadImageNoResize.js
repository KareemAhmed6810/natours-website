
const multer = require('multer');

const multerStorage = multer.diskStorage({
  //cn is a callback function like next butnot from express
  //file is req.file
  destination: (req, file, cb) => {
    cb(null, './../public/img');
  },
  filename: (req, file, cb) => {
    //rename the file to be sure no user override
    let imageExtension = file.mimetype.split('/')[1];
    let imgName = `user-${req.user._id}_${Date.now()}.${imageExtension}}`;
    cb(null, imgName);
  }
});
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(err, false);
};
const uploadOptions = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
exports.uploadUserModifiedPhoto = uploadOptions.single('photo');
 // req.files contains an array of uploaded files
