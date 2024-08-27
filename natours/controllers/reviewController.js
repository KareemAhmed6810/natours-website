const { Review } = require('./../models/reviewModel');
const factory = require('./handlerFactory');

const catchAsync = function(fn) {
  return function(req, res, next) {
    fn(req, res, next).catch(err => next(err));
  };
};

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId)
     filter = { RefToTour: req.params.tourId };
  const reviews = await Review.find(filter);
let msg=''
if (req.params.tourId) {
  msg = 'ONE SPECFIC TOUR';
} else msg = 'All reviews';
  res.status(200).json({
    msg,
    length: reviews.length,
    reviews
  });
});
//HENA FE CREATE REVIEW EZAY A3ML EL HANDLE FACTORY
// AST3ML MIDDLEWARE
exports.setTourUserIds=(req,ex,next)=>{
    if (!req.body.RefToTour) {
      req.body.RefToTour = req.params.tourId;
      console.log('noo req.body.tour is defineddd', req.body.RefToTour);
    }
    if (!req.body.RefToUser) {
      //hyakhdha mn middleware protection
      req.body.RefToUser = req.user.id;
      console.log('noo req.body.user is defineddd', req.body.RefToUser);
    }
    next()
}

exports.createReview =factory.createOne(Review)
 /*
 catchAsync(async (req, res, next) => {
  //allow nested routes
  /////////////*
  ab ma ast3ml el factory
  if (!req.body.RefToTour) {
    req.body.RefToTour = req.params.tourId;
    console.log('noo req.body.tour is defineddd', req.body.RefToTour);
  }
  if (!req.body.RefToUser) {
    //hyakhdha mn middleware protection
    req.body.RefToUser = req.user.id;
    console.log('noo req.body.user is defineddd', req.body.RefToUser);
  }
    /////////////
  const review = await Review.create(req.body);
  res.status(200).json({
    status: 'success',
    review
  });
});
*/
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.getReview = factory.getOne(Review);
exports.getAllModernReview = factory.getAllFilter(Review);