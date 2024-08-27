const express = require('express');
const morgan = require('morgan');

//no need to downlaod it is a buit in module
const path=require('path')
const errorHandling = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const AppError = require('./utlis/appError');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const app = express();
app.set('view engine', 'pug');
//hena hht el path app/set('views','./view') bs ana h3ml 
app.set('views', path.join(__dirname,'views'));
//HELMET AKHLEHA AWL WAHDA
//SER SECURITY HTTP HEADER
app.use(helmet());
//LIMIT REQUEST FROM API
const limiter = rateLimit({
  ///how amny requests per ip
  max: 100,
  //modt 2ad eh keda ana mkhleha 100 request max f el sa3a
  //windows de el moda
  windowMs: 60 * 60 * 1000,
  msg: 'too many reqs fromt this IP please wait'
});
// 3) ROUTES
app.use('/api', limiter);
// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
// we kan specify some options like size
// app.use(express.json({limit:'10KB'}));
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers)
  next();
});
//rendering pages in browser use get
app.use('/',viewRouter)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
//hena law wsl mn 8yr ma ydkhl l ay url mn fo2 ybaa katb haga 8lt
//all=>all methods
// *=all urls or every url
app.all('*', (req, res, next) => {
  // next(err);
  // if the next recives an argument no matter what it is express will know that its error
  // it will skip all middlewares and go to global error middleware
  next(new AppError(`can not find ${req.originalUrl} on this server`, 404));
});

//give middleware function 4 arguments and express will recgnize it automatllcy as error handling middleware
app.use(errorHandling.globalErrorHandling);

module.exports = app;
