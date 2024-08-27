const AppError = require('../utlis/appError');
const { User } = require('./../models/userModel');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
// const multerStorage = multer.diskStorage({
//   //destination here is a callback functions
//   //cb here is a callbackgunction a bit like next but it doesnot come from express so it is named as cb
//   destination: (req, file, cb) => {
//     //first parameter is for errors,second parameter is destination
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     //hdy el imageName hdeeh b el id we timeStamp
//     const extension = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user._id}-${Date.now()}.${extension}`);
//   }
// });
//AKTB EL FUNCTION KEDA LAW MESH H3MLA SAVE F EL DB D ANA 3AYZHA ASHT8L 3LEHA ZY EL RESIZE F MHATAGHA BUFFER
const multerStorage = multer.memoryStorage();
// check the what is uploaded is image
const multerFilter = (req, file, ch) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('NOT AN IMAGEE PLEASE UPLOAD IMAGE', 400), false);
};
const upload = multer({
  storage: multerStorage,
  filter: multerFilter
});

const catchAsync = function(fn) {
  return function(req, res, next) {
    fn(req, res, next).catch(err => {
      next(err);
    });
  };
};
const filterObj = (obj, ...allowedFields) => {
  const newobj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newobj[el] = obj[el];
  });
  return newobj;
};
exports.getAllUsers = async (req, res) => {
  const user = await User.find();
  res.status(400).json({
    user
    // message: 'This route is not yet defined!'
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
//updae data that is not password
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getUser = factory.getOne(User);
//ALWAYS HAVE ONE PLACE TO UPDATE PASSWORD AND OTHER PLACE TO UPDATE EVERYTHING
//USER HERE CAN ONLY UPDATE NAME ,EMAIL WHILE PASS ISIN AUTH CONTROLLER
exports.updateMe = catchAsync(async function(req, res, next) {
  console.log(req.file);
  console.log(req.body);
  console.log('**********************************************************');
  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError(`to update password visit/updatePassword`, 400));
  //filtering what we want to update afrd el user 8yr nfso l admin

  //mhttsh photo hena l2ny b3mlha ypdate mn body form data
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  console.log(filteredBody);
  // Request.USER.ID BST3MLHA LAMA EL USER YKOON 3AML LOGIN
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
  res.status(200).json({ msg: 'success', updatedUser });
});

//WHEN USER WANT TO DEELTE HIS ACCOUNT WE JUST DEACTIVATE IT.
//  WE DONT DEELTE THE DOCUMENT FROM DB WE JUST SET IT TO INACTIVE
//3ALASHAN A3ML KEDA WE WILL CREATE NEW PROPERTY SCHEMA ACTIVE TYPE BOOLEAN DEFAULT TRUE
exports.deleteMe = catchAsync(async (req, res, next) => {
  //NO NEED TO PASS DATA OR ID HERE ANA EL DATA ELL MHATHA MDEEYHALO FEL ID
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(200).json({
    status: 'success',
    msg: 'user is deleted suuccfully u can return in one month '
  });
});
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) next();
  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;
  //it will returns a promise
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});
