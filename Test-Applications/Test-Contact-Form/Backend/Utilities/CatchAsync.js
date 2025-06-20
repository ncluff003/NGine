export default (fn) => (request, response, next) =>
  fn(request, response, next).catch((error) => {
    console.log(error, error.message);
    return next(error);
  });
