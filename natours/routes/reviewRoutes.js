const express = require('express');
// When you create a child router with mergeParams: true, it tells Express to merge the parameters of the parent router into the child router.
//  This is necessary when you need to access route parameters (such as :id, :tourId, etc.) defined in a parent route within a
//  nested route handler.
const router = express.Router({ mergeParams: true });
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );
router
  .route('/:id')
  .get(reviewController.getReview)
  // .get(reviewController.getAllModernReview)

  .delete(reviewController.deleteReview)
  .patch(reviewController.updateReview);

module.exports = router;
