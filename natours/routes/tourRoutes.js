const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();
//The router.param() method is used to define middleware that will run before any route handler that uses the specified parameter(id in this case)
///we lazm tb3n aht next
// router.param('id', tourController.getTour);

//el mafrood bseebha ma3 getTours 3ady bs ana katbha wahda 3alashan at3lm
router.route('/tour-stats').get(tourController.getTourStatistcis);
router
  .route('/topcheap')
  .get(tourController.aliasTours, tourController.getspecficTour);

router.route('/filter').get(tourController.getSpecficTourModernWay);
router.route('/filter2').get(tourController.getspecficTour);
router.route('/monthly-Plan/:year').get(tourController.getMonthlyPlan);
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createModenTour)
  .delete(tourController.deleteAllTours);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    tourController.uploadTourImages,
    tourController.resizeTourPhoto,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );
/*
     router
       .route('/:tourId/reviews')
       .post(
         authController.protect,
         authController.restrictTo('user'),
         reviewController.createReview
       );
       // When you create a child router with mergeParams: true, it tells Express to merge the parameters of the parent router into the child router.
//  This is necessary when you need to access route parameters (such as :id, :tourId, etc.) defined in a parent route within a
//  nested route handler.
       */
router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
