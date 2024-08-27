// .get('/', (req, res) => {
//   res.status(200).render('base', {
//     variable: 'we can add variable from js',
//     tour: 'Mr tourist'
//   });

const { Tour } = require('./../models/tourModel');
const catchAsync = function(fn) {
  return function(req, res, next) {
    fn(req, res, next).catch(err => next(err));
  };
};
exports.getOverview = catchAsync(async (req, res) => {
  //1)GET TOUR DATA FROM COLLECTION
  // 2)BUILD TEMPLATE
  // 3)RENDER THAT TEMPLATE USING TOUR DATA FROM1
  // STEP 1:
  const tours = await Tour.find();
  // STEP 2:

  res.status(200).render('overview', {
    title: 'allTours',
    tours
  });
});
exports.getTour = catchAsync(async (req, res) => {
  //step 1: get the data from the requested tour including reviews and giudes
  console.log(req.params.slug);
  const tour = await Tour.findOne({ name: req.params.slug }).populate({
    path: 'usersReviews',
    fields: 'review rating RefToUser'
  });
  console.log(tour);
  //step 2: build template
  res.status(200).render('tour', {
    title: 'forest hiker'
  });
});
