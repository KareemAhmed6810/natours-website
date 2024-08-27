const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
//crypto is buit in node module
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'tell us ur name']
  },
  email: {
    type: String,
    required: [true, 'Please Provide ur Email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email']
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'tour', 'guide', 'lead-guide'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'please provide a password'],
    //3alashan a3mlha hide
    select: false,
    minlength: [8, 'password be more than 8 letters']
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please provide a Confirmpassword'],
    validate: {
      validator: function(val) {
        // this only works on save so when we update user we will use save not findOneAndUpdate
        return val === this.password;
      },
      message: 'passwords are not the same'
    }
  },
  passwordChangedAt: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  //da el cost parameter  momkne akhleeh 10 bs el computers ba2et powetul fkhenah 12 it depends on cpuintensive
  // thie higher the number is the more cpu intensive the process will be and the more stronger password
  const saltRounds = 12;
  //hash is async and sync , we will use async
  this.password = await bcrypt.hash(this.password, saltRounds);
  //ba3d ma 3mlt passwird comapre with passswordConfirm delw2ty a3ml delete passwordConfirm
  this.passwordConfirm = undefined;
  next();
});

/*INSTANCE METHOD==>it is method that will be avillable on all documents of a certain collection
 */
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassWord
) {
  //this here is to the current document
  //khly balk this.password is not avillable because we make select:false
  return await bcrypt.compare(candidatePassword, userPassWord);
};
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  //3mlt field exmo passwordChangedAt
  if (this.passwordChangedAt) {
    //10 is the base number
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimeStamp;
    /*example
token is issued at time 100
JWTTimestamp=100
password changed at 200
changedTimeStamp
return true then the password changed after token is issued
*/
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  //password reset taken is random string but not strong as hashing
  // so we will use crypto
  // ba3d randomBytes bht number of characters and then convert it to hexadecimal
  const resetToken = crypto.randomBytes(32).toString('hex');
  //this resetToken is what we gonna send to the user and only the user have access to the token
  //resetToken is not saved on db as if there is a hacck on db so it is never stored as plain
  //sha256 is algorithm
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  //h3mlo save f el dbb 3alshana a3ml compare ll user hyb3to
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  //bb3t el YNencrypted l2n law ba3t elly encrypted f el email eh el faydaa
  //3aml return 3alshan ytb3t email
  console.log(
    `from userModel createPasswordResetToken ${resetToken}  ,  ${(this
      .passwordResetToken,
    this.passwordResetExpires)} `
  );
  return resetToken;
};
userSchema.pre('save', function(next) {
  if (this.isModified('password') || this.isNew) return next();
  //SAVING TO THE DATABASE IS SLOWER THAN SENDING THE TOKEN
  //b3ml substract one second 3alshan byhsl delay seka 3alshan at2kd el token at3ml ba3d ma 3mlt el password
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//query middleware mst3mlo 3alashan lama a getAllUsers el user ell active:false mygeesh
userSchema.pre(/^find/, function(next) {
  // this points to the current query
  // this.find({ active: true });
  this.find({ active: { $ne: false } });
  next();
});
const User = mongoose.model('User', userSchema);

module.exports = { User };
