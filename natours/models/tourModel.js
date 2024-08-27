const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const { User } = require('./userModel');
//slugify creates slugs. slugs is just a string that we can put in url based on string like name
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      maxLength: [50, 'a tour name mustnot exceed 50'],
      minLength: [5, 'At least five letters are required']
      //validator da mnzlo mn npm
      //momken a3mlha regex
      // validate:[validator.isAlpha,'tour nam must only contain charcterstics']
    },
    slug: String,

    duration: {
      type: Number,
      required: [true, 'tour must tell the duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'tour must tell the groupSize']
    },
    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, or difficult'
      },
      required: [true, 'A tour must have a difficulty']
    },
    price: { type: Number, default: 2500 },
    priceDiscount: {
      type: Number,
      validate: {
        //this function doesnot work on update it will work on creating new docs only
        validator: function(val) {
          //val btrg3 ll property elly ana feha
          return val < this.price;
        },
        //bt3ml access ll value 3n tree2 el mongo keda({})
        message: 'Discount should be below regular price ({VALUE})'
      }
    },
    summary: {
      type: String,
      //trim is option only for string removes all white space at the beginning and end of string
      trim: true,
      required: [true, 'tour must give a summary']
    },
    description: {
      type: String,
      trim: true
    },
    //rating avg and rating quantity are not i/p they will be calculated from total tours review
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be more than 1'],
      max: [5, 'ratig must be less 5']
    },
    ratingsQuantity: { type: Number, default: 0 },
    //image cover is the images u see on overview page
    imageCover: {
      //da name of image elly h3mlo read mn el file system as the refrence is stored in DB,
      // it is not good idea to save the image in db we leave the images in file system and put the name of image itself in db
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    //rest of images
    //array of string
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      //fe hagat el amfrood mkhlesh el user mn el model nfso zy el passord we created at bkhfeha mn el model nfso
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      // We expect an array of numbers, coordinates of the point
      coordinates: [Number],
      address: String,
      // User description of the location
      description: String
    },
    // Locations is an array of embedded documents
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        // User description of the location
        description: String,
        day: Number
      }
    ],
    //keda da embedded
    //ana hena b3ml embedding llusers f el tourgiude
    guides: Array,
    //keda daa ref ezay mongose t3rf
    guidesRef: [
      {
        //it will contain only ids not the user document
        type: mongoose.Schema.Types.ObjectId,
        // esm el model we mesh lazm a3mlo require ana 3aml el require da ll embedded
        ref: 'User'
      }
    ]
  },
  {
    //when data is outputted as json or object show virtuals
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
//DOCUMENT MIDDLEWARE
//get here is called a getter
//m2drsh ast3ml output virtual f el query ya3ny mubf3sh a2ol tour,find(durationweeks gte 7)
// Schema.virtual('functionName').get
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});
//VIRTUAL POPULATION
tourSchema.virtual('usersReviews', {
  //refer to the name of model we wan to refrecne
  ref: 'Review',
  // refers to the name of the field in the other model
  foreignField: 'RefToTour',
  //local field yan3y esmha 3ndy ana f el model ehhh
  localField: '_id',
  options: { select: 'review RefToTour' } // Select specific fields ('review' and 'rating') from Review documents
});

/* virtual porperties=>fields that we can define on our schema but they will not be saved in database
 we use it in things like conversion from mile to km we dont need to save both on db

 */
/*
// pre m3naha it will run before the save() and create() but not insertMany
//each a pre middleware function have access to next
tourSchema.pre('save', function(next) {
  //this here have access to the document being proccessed just before being saved to DB
  console.log(this);
  //this is the processed document so we can define a new property
  this.  = slugify(this.name, { lower: true });
  // law mesh m3rf slug f el schema we 3rftha f el fucntion it will not be presisted or saved in DB
  next();
});
//DOCUMENT MIDDLEWARE POST
//pst middle ware has acces to doc that is just saved to DB
tourSchema.pre('save',function(next){
  console.log("we can attach many document middleware");
  next();
})
tourSchema.post('save',(doc,next)=>{
//there is no this here we access doc though doc
console.log(doc);
next();
})
*/

/*
//QUERY MIDDLEWARE
tourSchema.pre('find',function(next){

//lama ast3ml this keyword htshawer 3ala el current query not the document
//hena da query we can do chaining

this.find({secretTour:{$ne:true}});
  next();
})

tourSchema.pre('findOne', function(next) {
  //lama ast3ml this keyword htshawer 3ala el current query not the document
  //hena da query we can do chaining

  this.find({ secretTour: { $ne: true } });
  next();
});
*/
//aw bdl ma aktb kol waha find,findOne,findByUpdate ana ast3ml regex
tourSchema.pre(/^find/, function(next) {
  //lama ast3ml this keyword htshawer 3ala el current query not the document
  //hena da query we can do chaining

  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
// at post u get access to the document.this middle ware is run after the document is executed
tourSchema.post(/^find/, function(doc, next) {
  console.log(
    `FROM POST QUERY MIDDLEWARE  IT TOOK ${Date.now() - this.start} milliSecond`
  );
  next();
});

//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  //this hena b
  console.log(this);
  /*
  da el output 3ayz azwd contoin 3ala kol el aggregation
  ast3ml pre
_pipeline: [
    { '$match': [Object] },
    { '$group': [Object] },
    { '$sort': [Object] }
  ],
  */
  next();
});
tourSchema.pre('save', function(next) {
  if (this.difficulty) {
    this.difficulty = this.difficulty.toLowerCase();
  }
  next();
});

//DOCUMENT MIDDLEWARE
tourSchema.pre('save', async function(next) {
  // map method will assign the result of each is array of promisees
  /*

In the tourSchema.pre('save', async function(next) { ... }) hook, the map method is used to iterate over this.guides 
and for each id, it calls User.findById(id) which is an asynchronous operation and returns a promise.
 Since map doesn't wait for promises to resolve, it results in an array of promises.
                     OR
  tourSchema.pre('save', async function(next) {
  // Create an empty array to store the resolved values
  const guides = [];

  // Use for...of loop to handle async/await
  for (const id of this.guides) {
    const guide = await User.findById(id);
    guides.push(guide);
  }

  // Assign the resolved values to this.guides
  this.guides = guides;

  // Proceed to the next middleware
  next();
});

  */
  const giudesPromise = this.guides.map(async function(id) {
    return await User.findById(id);
  });
  this.guides = await Promise.all(giudesPromise);
  next();
});

//query middleware
tourSchema.pre(/^find/, function(next) {
  // this hena btshawer 3ala current query
  this.populate({
    path: 'guidesRef',
    select: 'email'
  });
  next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = { Tour };
