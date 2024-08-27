const fs = require('fs');
const { Tour } = require('../models/tourModel');
const { ApiFeaturesOutSide } = require('./../utlis/apiFeatures');
const AppError = require('./../utlis/appError');
const factory = require('./../controllers/handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = function(fn) {
  // fn de htrg3 promise
  //fn keda mesh fahma el 3 parameters
  // fn(req,res,next).catch(err=>next(err));
  /*el sa7*/
  /*
exports.createModenTour = catchAsync(async function(req, res, next) {
catchAsync ana 3mltha 3alashan akhls mn el try catch we catch async htrg3ly fucntion elly hyt3mlha assigned l createTour
  */
  return function(req, res, next) {
    fn(req, res, next).catch(err => next(err));
  };
};

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
exports.uploadTourImages = upload.fields([
  //exm el field f el TourModel

  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);
exports.resizeTourPhoto = catchAsync(async (req, res, next) => {
  //files l2no array of image
  console.log(req.files);
  /*

 imageCover: [
    {
      fieldname: 'imageCover',
      originalname: 'new-tour-1.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 48 00 48 00 00 ff e1 00 8c 45 78 69 66 00 00 4d 4d 00 2a 00 00 00 08 00 05 01 12 00 03 00 00 00 01 00 01 ... 1857218 more bytes>,
      size: 1857268
    }
  ],
  images: [
    {
      fieldname: 'images',
      originalname: 'new-tour-2.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 48 00 48 00 00 ff e1 00 8c 45 78 69 66 00 00 4d 4d 00 2a 00 00 00 08 00 05 01 12 00 03 00 00 00 01 00 01 ... 2321585 more bytes>,
      size: 2321635
    },
 EL BA2Y KEDAA
  ]
}*/

  if (!req.files.imageCover || !req.files.images) next();
  //  el step de 3alahan el update

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}.jpeg`;

  //it will returns a promise FOR THE IMAGEcOVER
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({
      quality: 90
    })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  req.body.images = [];
  //AGAIN video 204 min 9
  /*error
 req.files.images.foreach(async (file, idx) => {
    const fileName = `tour-${req.params.id}-${Date.now()}- ${idx+1}.jpeg`;
      await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({
          quality: 90
        })
        .toFile(`public/img/tours/${fileName}`);
        req.body.images.push(fileName)
  })
  */
 //we use map to loop on them
  await Promise.all(
    req.files.images.map(async (file, idx) => {
      const fileName = `tour-${req.params.id}-${Date.now()}- ${idx + 1}.jpeg`;
      await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({
          quality: 90
        })
        .toFile(`public/img/tours/${fileName}`);
      req.body.images.push(fileName);
    })
  );
  next();
});

//law habb arf3 sora wahda ya3ny mn 8yr imageCover
// upload.single('image')
//3ayz arf3 kaza sora
// upload.array('images',5)
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.getAllTours = catchAsync(async function(req, res, next) {
  //return all tours
  const allTours = await Tour.find();
  res.status(200).json({
    status: 'success',
    results: allTours.length,
    allTours
  });
});

exports.createTour = async function(req, res, next) {
  //with async await we use try catch to handle errors
  try {
    /* creating new document has two methods:
  1)we call the method on the new document
  const newTour=new Tour({});
  newTour.save();
2)we call the method directly on tour
  Tour.create(pass the data here)

  const newUser = await User.create(req.body);
OR
const newUser = new User(req.body);
await newUser.save();

  */
    //returns a promise
    const newTour = await Tour.create(req.body);

    //law 3ayz adkhl array of users ast3ml insertMany
    // const newTour = await Tour.insertMany(req.body);

    res.status(200).json({
      msg: 'user is added succfully',
      Tour: newTour
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      err
    });
  }
};
exports.getTourFactory = factory.getOne(Tour, { path: 'usersReviews' });

exports.getTour = catchAsync(async function(req, res, next) {
  // const tour = await Tour.findById(req.params.id);
  //populate 3alashan ymla el field elly ana 3amlo refer f el model ya3ny lama ageeb el user by id byban lakn law kolo btbaa 3lehom
  // const tour = await Tour.findById(req.params.id).populate('guidesRef');
  //we can add options to hide somthing we dont want

  //momken baa bdl ma a3mlha a3ml k query middleware we kama 3alashan el update
  const tour = await Tour.findById(req.params.id).populate('usersReviews');
  console.log(tour.usersReviews);
  // .populate({
  //   path: 'guidesRef',
  //   select: '-__v -email'
  // });

  if (!tour) {
    //law mfeesh return bykml el function  we formmm2 httb3 bykml el function next de k2nha calling functoin
    return next(new AppError('no found tour with this ID', 404));
  }
  // console.log('FROMMMMMMM2');

  res.status(200).json({
    msg: 'User Found from getTour function',
    tour: tour
  });
});
exports.updateTour = factory.updateOne(Tour);
// catchAsync(async (req, res, next) => {
//   console.log('Request Params:', req.params);
//   console.log('Request Body:', req.body);
//   const newtour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true
//   });

//   if (!newtour) {
//     //law mfeesh return bykml el function  we formmm2 httb3 bykml el function next de k2nha calling functoin
//     return next(new AppError('no found tour with this ID', 404));
//   }
//   res.status(200).json({
//     msg: 'Tour updated successfully',
//     data: newtour
//   });
// });

exports.deleteTour = factory.deleteOne(Tour);
/*
exports.deleteTour = catchAsync(async (req, res, next) => {
  const deletedTour = await Tour.findByIdAndDelete(req.params.id);
  if (!deletedTour) {
    res.status(404).json({ msg: 'Tour not found' });
  }
  res.status(200).json({ msg: 'Tour deleted successfully' });
});
*/
//delete all documents

exports.deleteAllTours = catchAsync(async (req, res, next) => {
  const deletedTour = await Tour.deleteMany();
  if (!deletedTour) {
    res.status(404).json({ msg: 'Tour not found' });
  }
  res.status(200).json({ msg: 'Tour deleted successfully' });
});

/*ahna khlsnaa fo2 el main CRUD
/*********************filtering******************** */
exports.getspecficTour = catchAsync(async (req, res, next) => {
  console.log(` awl line men get specficTour\n ${req.query} `);
  /*
   let q={age:22};
   //hena =byshawer 3leha k refrence f ay t8yeer f el S hysm3 f el q
let s=q;
s.age=44;
console.log(q.age);
// hena 3ml destroy ll q we create wahde gddeed el s we le mkan tany f el memory
let m={...q};
m.age=888;
console.log(q.age);
*/
  //BUILD QUERY
  // 1A)Filtering
  const queryObj = { ...req.query };
  console.log(JSON.stringify(queryObj));
  const execludedField = ['page', 'sort', 'limit', 'fields'];
  execludedField.forEach(el => delete queryObj[el]);

  // 1B)Advanced filtering
  //shakl el req.query
  // { duration: '3'}
  // 127.0.0.1:3000/api/v1/tours?duration[gte]=3&difficulty=easy
  let queryStr = JSON.stringify(queryObj);
  console.log(queryStr);

  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  // f tb2a bdl gt $gt
  console.log(queryStr);
  // hwlha mn string l code js
  let parsedQuer = JSON.parse(queryStr);

  console.log(parsedQuer);
  let toursQuery = Tour.find(parsedQuer);
  // let toursQuery=Tour.find()
  //sorting
  // 127.0.0.1:3000/api/v1/tours/filter?sort=price,createdAt
  if (req.query.sort) {
    console.log('********************');
    console.log(req.query.sort);
    let sortBy = req.query.sort.split(',');
    console.log(sortBy);
    sortBy = sortBy.join(' ');
    console.log(sortBy);
    toursQuery = toursQuery.sort(sortBy);
  } else toursQuery = toursQuery.sort('ratingsAverage price');
  /******************************************* */

  /*field limiting==>it is always ideal for client to recive minmum data as possible
 for heavy data sets to reduce bandwidth consumed for each request
  */
  if (req.query.fields) {
    // console.log(req.query.fields);
    let fields = req.query.fields.split(',').join(' ');
    console.log(fields);

    toursQuery = toursQuery.select(fields);
  } else {
    //minus law abl el haga m3naha hide
    toursQuery = toursQuery.select('-__v');
  }
  //PAGINATION
  /*it means page 2 with 10 results 11=>20 and hw will skip 10 values
 toursQuery.skip(10).limit(10);
 */

  const page = req.query.page * 1 || 1;
  const limit = Number(req.query.limit) || 2;
  const skip = (page - 1) * limit;

  toursQuery = toursQuery.skip(skip).limit(limit);
  if (req.query.page) {
    const numOfDocs = await Tour.countDocuments();
    if (skip >= numOfDocs) throw new Error('this page doesnot exist');
  }
  //QUERY EXECUTION
  const tours = await toursQuery;

  res.json({ length: tours.length, tours });
});
//hena mesh catchAsync leeh? l2noo mfeesh promise aw return
exports.aliasTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary';
  next();
};

/*

 ana momken a3ml search b el mongo we el mongoose 3alashan el mongoose leha special methods bta3tha
1)Mongo
 const tours=await Tour.find({
      duration:5,
      diffculty:'easy'
    });
    
  //  2)Mongoose
  const tours1 = await Tour.find()
    .where('duration')
    .equals(5)
    .where('difficulty')
    .equals('easy');
  res.status(200).json({ tours1 });

  */

//delw2ty ana law 3ayz ast3ml el functions fe makan tany filterig,sorting,etc

class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryObj = { ...this.queryString };
    const execludedField = ['page', 'sort', 'limit', 'fields'];
    execludedField.forEach(el => delete queryObj[el]);

    // 1B)Advanced filtering
    //shakl el req.query
    // { duration: '3'}
    // 127.0.0.1:3000/api/v1/tours?duration[gte]=3&difficulty=easy
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    queryStr = JSON.parse(queryStr);
    this.query = this.query.find(queryStr);
    // ana 3aml chaining fo2 filter we b3dha sort f el sort hyst2bl eh
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      console.log('********************');
      console.log(this.queryString.sort);
      let sortBy = this.queryString.sort.split(',');
      console.log(sortBy);
      sortBy = sortBy.join(' ');
      console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else this.query = this.query.sort('ratingsAverage price');
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      // console.log(this.queryString.fields);
      let fields = this.queryString.fields.split(',').join(' ');
      console.log(fields);

      this.query = this.query.select(fields);
    } else {
      //minus law abl el haga m3naha hide
      this.query = this.query.select('-__v');
    }
    return this;
  }
  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = Number(this.queryString.limit) || 2;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
exports.getSpecficTourModernWay = catchAsync(async (req, res, next) => {
  const features = new ApiFeaturesOutSide(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  const tours = await features.query;
  res.status(200).json({ length: tours.length, tours });
});
/*aggregation*/
exports.getTourStatistcis = catchAsync(async (req, res, next) => {
  // in aggregation we pass araay of stages and it [asses it one by one]
  //ast3mlt wait l2nha btrg3 aggregate zy ma find btrg3 query
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4 } }
    },
    {
      $group: {
        // id:null m3naha ydeek kol haga fe one group
        _id: null,
        //newField ana elly h3mlo  , $avg da mongodb elly 3mlaa

        //line da m3naha yzwd 1 3ala kol document y3do ya3ny mn el akhr bygeen number of docs
        numTours: { $sum: 1 },
        //elly b3d : place where i extract data from
        numRatings: { $sum: '$ratingsQuantity' },
        AvgRating: { $avg: '$ratingsAverage' },
        AvgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    }
  ]);
  const stats2 = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4 } }
    },
    {
      $group: {
        // id:null m3naha ydeek kol haga fe one group
        // _id: '$difficulty',
        //hykhleha capital
        _id: { $toUpper: '$difficulty' },
        //newField ana elly h3mlo  , $avg da mongodb elly 3mlaa

        //line da m3naha yzwd 1 3ala kol document y3do ya3ny mn el akhr bygeen number of docs
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        AvgRating: { $avg: '$ratingsAverage' },
        AvgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      //ana hena ynf3 ast3ml el fieldname elly f el group lakn mynf3sh ast3ml field mn bto3 el model
      //m3naha ascending
      $sort: { AvgPrprice: 1 }
    }
    // ,
    // //we can repeat stages
    // {
    //   // hena b2olo ygeeb ay haga el diffculty bta3tha not equal EASY
    //   $match:{_id:{$ne:'EASY'}}
    // }
  ]);
  res.json({ stats, msg: '***************************************', stats2 });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  let year = Number(req.params.year);
  let plan = await Tour.aggregate([
    {
      /* unwind=>decosntruct array field from the info doucment and then output one document for each element of array
        law 3ndy users 3ndo 3 starting dates gyly kol shahr ybaa el user daa ybaa leh 3 docs
*/
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          //b2olo ygeeb el nas elly htsafr fe 2021
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        //mongodb operator
        _id: { $month: '$startDates' },
        numTour: { $sum: 1 },
        // hena b2olo ybynly meeen hysafr
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        //y3mlo hide law 1 show
        _id: 0
      }
    },
    {
      //hena yrtbhm mn wl kbeer ll so8ayr
      // $sort:{numTour:-1}
      $sort: { month: -1 }
    },
    {
      //m3naha tbyn 12 bs
      $limit: 12
    }
  ]);
  res.json({ plan });
});

exports.createModenTour = catchAsync(async function(req, res, next) {
  const newTour = await Tour.create(req.body);
  res.status(200).json({
    msg: 'user is added succfully',
    Tour: newTour
  });
});
