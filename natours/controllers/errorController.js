const AppError = require('../utlis/appError');


const handleWebTokenError=err=>{
  return new AppError('INVALID TOKEN PLEASE LOG IN',401);
}
const handleCastErrorDB = err => {
  return new AppError(`INVALID ${err.path}   ${err.value}`, 400);
};
const handleDuplicateFields = err => {
  const value = err.keyValue.name;
  return new AppError(
    `duplicate value  *** ${value}*** please use another value`,
    400
  );
};
exports.globalErrorHandling = (err, req, res, next) => {
  // 500=>internal server error
  console.log('HELLO FROM GLOBAL ERROR HANDLING');
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  //3mltha el tweela bdl de 3alashan keda
  /*However, the Error object in JavaScript has some properties like message and stack that are non-enumerable,
 which means they won't be copied over using the spread syntax. That's why in your initial example, error.message was undefined after using { ...err }.

To explicitly copy these properties, you can combine the spread syntax with direct property assignment:*/
  // let error = { ...err };
  let error = { ...err, message: err.message, stack: err.stack };

  if (process.env.Node_ENV === 'development') 
    {
    if (error.code === 11000) {
      error = handleDuplicateFields(error);
    }
    if (error.name === 'JsonWebTokenError')
    {

error=handleWebTokenError(error);
console.log(
  `@ production ${error.message}  ${
    error.statusCode
  }  from global error handling`
); 
    }
      // if(error.name='')
      res.status(err.statusCode).json({
        status: error.status,
        error: error,
        msg: error.message,
        stack: error.stack
      });
  } 
  
  
  else if (process.env.Node_ENV === 'production') {
    let error = { ...err };
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        msg: err.message
      });
    } else {
      console.log('ERORRR FROM not operational', err);
      if (error.name === 'CastError') {
        //errorror da bytl3 lama aktb id mesh id asln example /ddddddddddd
        error = handleCastErrorDB(err);
        //we will pase the rror mongo crea
      }
      res.status(500).json({
        status: 'Error',
        msg: 'somthing went very wrong'
      });
    }
  }
};
