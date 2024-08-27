const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review is required']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Rating is required between 1 and 5']
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    RefToTour: 
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'must belong to a tour']
      }
    ,
    RefToUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a User']
    }
  },
  {
    //when data is outputted as json or object show virtuals
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
//ana aw 3ml refrence l 2docs ast3ml poulae mrteen
//ana hena el reviews 3arfa el user 2al eh 3n el tour bs el tour my3rfsh at2alo 3n eh
//momekn a3ml populate bs htnaa ssa3b f el time
reviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //   // In the populate function, the path option specifies the field in the document that you want to populate. 
	// // This field should be defined in your schema as a reference to another model
  //   path: 'RefToTour',
  //   select: 'name'
  // }),
    this.populate({
      path: 'RefToUser',
      select: 'name'
    });
  next();
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = { Review };
