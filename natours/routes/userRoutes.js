const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const router = express.Router();
// el makan elly b3mlo save for images
router.post('/signup', authController.signup);
router.post('/login', authController.login);
//forgotpassword only recives email address
router.post('/forgotPassword', authController.forgotPassword);
//rest password recive the token and the new password
router.patch('/resetPassword/:token', authController.resetPasssword);
router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);

// we will keep the routes because system adminstator if he want to update or deltete or get all users
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

//any protected route lazm arooh l postman we akhly authrization bearer token jwt
// upload.single('name of the file')
router.patch(
  '/updateMe',
  authController.protect,
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,

  userController.updateMe
);
router.delete('/deleteMe', authController.protect, userController.deleteMe);
//endPoint where user can get his dataa
// router.route('/me').get(authController.protect, userController.getMe,userController.getUser);
/************************************************************************** */
/*bos henaa bdl ma aktb  authController.protect   KHLY BALK EL MIDDLEWARE BYTKTB MHM TRTEEBO 
YA3NY KEDA HY3DY 3ALA KOL EL ROUTES LAW ML2ASH YWSL LL MIDDLEWWARE
*/
router.use(authController.protect);
router.route('/me').get(userController.getMe, userController.getUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
//nested Routes example  post /tour/tourID/reviews
module.exports = router;
