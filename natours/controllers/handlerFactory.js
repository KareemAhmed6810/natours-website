const { ApiFeaturesOutSide } = require('../utlis/apiFeatures');
const AppError = require('./../utlis/appError');
const catchAsync = function(fn) {
  return function(req, res, next) {
    fn(req, res, next).catch(err => next(err));
  };
};
exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError('no doucment found with id', 404));
    res.status(204).json({
      status: 'success',
      data: null,
      Msg: 'Deleted Successfully'
    });
  });
exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) return next(new AppError('no doucment found with id', 404));
    res.status(200).json({
      status: 'success',
      doc
    });
  });
exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(200).json({
      status: 'success',
      data: doc
    });
  });
exports.getOne = (Model, populateOptions) => 
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    let doc = await query;
    if (!doc) return next(new AppError('no doucment found with id', 404));

    res.status(200).json({
      status: 'success',
      data: doc
    });
  });

   
exports.getAllFilter=(Model)=>catchAsync(async (req, res, next) => {
	//law 3ayz adkhl goz2 el review bta3 el merge params
	//   let filter = {};
    // if (req.params.tourId) filter = { RefToTour: req.params.tourId };
  const features = new ApiFeaturesOutSide(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  const tours = await features.query;
  res.status(200).json({ length: tours.length, tours });
});
