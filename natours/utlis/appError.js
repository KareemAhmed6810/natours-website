/*In Express.js, passing an argument to the next function indicates that an error has occurred. When you pass an argument to next, 
it is treated as an error and skips all remaining non-error handling middleware and routes, jumping directly to the error-handling middleware.
*/
//class inheritance

class AppError extends Error {
  constructor(message, statusCode) {
    // when we extend a parent class we call super in order to call parent constructor we do it with msg
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : error;
    this.isOperational = true;
	//ask chatgpt
	Error.captureStackTrace(this,this.constructor);
  }
}
module.exports=AppError
/*

Error.captureStackTrace(this, this.constructor);: This line is called within the AppError constructor.
 It instructs JavaScript to capture the current call stack (the sequence of function calls) 
 starting from the point where an instance of AppError is created. This helps in tracing back to where the error originated.

 */