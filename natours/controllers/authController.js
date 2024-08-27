const { User } = require('./../models/userModel');
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('./../utlis/appError');
const sendEmail = require('./../utlis/email');
function createToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}
function createTokeninCookies(id, res) {
  /*
ana lazn ab3t el token f el cookies
cookies is a small piece of text that can server can send to client and when browser recives it 
browser automatically store it and send it back with all future requests
 res.cookie('cookieName',the data we want to send,{
  // options we want to pass
  browser deltes cookie after it is expired b3mlo fel dotenv
  expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000)
 BKTBHA MN 8YR DAYS =RKZ L2NY HDKHLA CODE JS WE AHWLHA MILLISECOND
  JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
 })  
*/

  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    //cookie is send on encrypted connection bkhleha true at production
    secure: false,

    //cookie will never be accessed or modified
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;
  res.cookie('jwt', token, cookieOption);
  return token;
}

/*


higher order function takes another function as a parameter or return to u another function
 WHY WOULD A FUNCTION TAKE ANOTHER FUNCTION AS A PARAMEER?
setTimeout we wait some time and then do some sereis of commands so we here a pass function as a parameter






*/

const catchAsync = function(fn) {
  //de el function elly htrg3
  /*
  catchAsync: This function takes another function fn as an
   argument and returns a new function. The returned function takes three parameters:req,res, and next
   */
  return function(req, res, next) {
    fn(req, res, next).catch(err => next(err));
  };
};
exports.signup = catchAsync(async (req, res, next) => {
  //dewl2ty el line da fe moshkela we create a newuser taking all the daata in the body we keda ay hd momken y3ml nfso admin BIG SECURITY PROBLEM

  // const newUser=await User.create(req.body);
  //tyb delw2ty law 3ayz admin register a3mlo ezay?
  // to create a new adminstarotor create a new user and edit the role in mogodbCompasee or define a special route for creating admins
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  });
  // const token=jwt.sign({id: newUser._id},'secret 32 bit or more')

  /*  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  */
  const token = createTokeninCookies(newUser._id, res);
  //log the userin as when i new email on any website iam automatically logged in
  //201==>for user created
  //TO REMOVE USER PASSWORD FROM OUTPUT
  newUser.password = undefined;
  res.status(201).json({
    status: 'success',
    token,
    user: newUser
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //STEP 1:check if email and password exist
  if (!email || !password) {
    return next(new AppError('please provide email and password', 400));
  }
  //STEP2:check if user exists and password is correct
  //select b3mlha 3alsahna khly el ouput hagat mo3yna law 3ayz baa abyn haga select:false ahtlha + ablha zy lama habt akhfy el __V hatt -
  //ana hena b2ol ll password elly m3mlo false 3ala el user yegy m3ah
  const user = await User.findOne({
    email
  }).select('+password');

  //ast3mlt await l2nha f el model async function
  if (!user) return next(new AppError('Email or password is wrong', 400));

  const correct = await user.correctPassword(password, user.password);

  /*3ndu moshkela afrd el user da mlosh wgood asln user.findOne() mrg3tsh haga henaa baa lazm a3ml keda
WRONG if(!user || !correct)
CORRECT
 if(!user || await User.correctPassword(password, user.password);)

*/

  if (!user || !correct)
    // 401 MEANS UNAUTROSIZED
    return next(new AppError('INCORRECT EMAIL OR PASSWORD', 401));

  //STEP 3:if everything is ok send token
  const token = createToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
});

/*how to give login users access to protected Tours
akhly mskn getAlltours ll nas elly 3amla login*/
exports.protect = catchAsync(async function(req, res, next) {
  /* STEPS
 1)GET THE TOKEN  
2)TOKEN VERIFICATION  
	3)CHECK IF USER EXIST
	4)CHECK IF USEER CHANGED PASSWORD IF JWT WAS ISSUED

			 */
  // STEP 1:GET TOKEN
  //rkz m3rf el token baraa
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    //m3naha ba3d ma y3ml split ydeeny el second elemnet
    token = req.headers.authorization.split(' ')[1];
    // console.log(token)
  }
  if (!token) {
    //law mfesh token m3naha m3mlsh logged in  . 401 m3anaha not authroized
    return next(
      new AppError('u r not logged in !!!!!.PLEASAE LOG IN TO GET ACCESS', 401)
    );
  }
  //STEP 2 VERFICATION TOKEN
  //verify requires a callback function bs momken m adeeha callback ahwlha async,await
  // jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
  // 	console.log(decoded);

  // 	});
  /*
The jwt.verify function from the jsonwebtoken library is asynchronous.
 It takes a callback function that is called once the verification process is complete.

*/
  //DECODED DA EL ID
  /*

  promisify is a utility function provided by the util module in Node.js that converts a function that uses a callback pattern 
  (i.e., a function that expects a callback as its last argument) into a function that returns a Promise.
   This allows you to use the converted function with modern JavaScript features like async/await.
  */
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log('Decoded token:', decoded);
  console.log('httl3 abl el jwt verify l2nha async');
  //STEP 3 CHECK IF USER EXIST AS IF USER HAS BEEN DELTED BUT THE TOKEN WILL STILL EXIST OR
  //   WHAT IF USER CHANGES PASSWORD BECAUSE SOME STOLE HIS JWT
  //3A CHECK IF USER IS EXIST
  //  da shkel el outpud Decoded token: { id: '668ea16b151cce94d87797c3', iat: 1720628765, exp:1728404765 }
  let freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('the user no longer exist', 401));
  }
  //4)CHECK IF THE PASSWORD CHANGED AFTER THE TOKEN WAS ISSUED , BTT3ML F EL MODEL ,iat= issued at
  /*JWT and Password Changes
JWT Issuance: When a user logs in, a JWT (JSON Web Token) is issued, which typically includes the user’s ID and an iat (issued at) timestamp. This token is used for subsequent requests to authenticate the user.

Password Change: If the user changes their password after the token is issued, the original token becomes potentially insecure.
 This is because someone might have stolen the token and is using it for unauthorized access. 
 Changing the password should invalidate all previously issued tokens.*/
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'user recently has changed the password please login again',
        401
      )
    );
  }

  //grant access to the protected router
  req.user = freshUser;
  next();
});
//how to pass arguemnts to middleware we need to pass argument to pass a middle ware
//we will create a wrapper function that will return the middle ware
exports.restrictTo = (...roles) => {
  //roles is an array
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      //403 IS FORBIDDEN
      return next(
        new AppError('U DONT HAVE OREMISSION TO DO THIS ACTION', 403)
      );
    }

    next();
  };
};
exports.forgotPassword = catchAsync(async function(req, res, next) {
  //STEP 1:get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('there is no user with this email address', 404));

  //STEP 2:genrate the random rest token not jwt and this step is done on the model

  const resetToeken = user.createPasswordResetToken();
  // for save only mesh l create
  await user.save({ validateBeforeSave: false });
  //STEP 3:Send the email to the user
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToeken}`;

  const msg = `FORGOT UR PASSWORD SUBMIT A PATCH REQUEST with ur new password and password confirmation to ${resetUrl}
  .\n if not ignore this email`;
  //mst3mltsh global error handling leeh l2n lazm reset ll token we el expire

  try {
    await sendEmail({
      email: user.email,
      subgject: 'it will expire in 10 min',
      msg
    });
    res.status(200).json({
      status: 'success',
      msg: 'token sent to email'
    });
  } catch (err) {
    user.passwordResetExpires = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log('ddddddddd', err);
    return next(
      new AppError('there was an error sending email try again', 500)
    );
  }
});
exports.resetPasssword = catchAsync(async function(req, res, next) {
  /*STEP1:get user based on token
STEP2: IF TOKEN HAS NOT EXPIRED AND THERE IS USER SET PASSWORD
STEP3: UPDATE changePasswordAT FOR THE USER
STEP 4:LOG THE USER IN SEND JWT




  */
  //encfrypt the token again and then compare
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  if (!user) return next(new AppError('token is invalid or has expired', 400));
  //CHANGE PASSWORD CREATED AT FOR THE MODEL USE PRE SAVE AND LOG THE USER IN SEND JWT
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  const token = await createToken(user._id);
  await user.save();
  res.status(200).json({
    status: 'success',
    token
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  await createTokeninCookies(user._id, res);
  res.json({ msg: 'password is updated' });
});
