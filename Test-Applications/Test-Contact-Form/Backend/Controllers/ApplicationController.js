////////////////////////////////////////////
//  My Middleware
import catchAsync from '../Utilities/CatchAsync.js';

////////////////////////////////////////////
//  Exported Controllers
export const getData = catchAsync(async (request, response, next) => {
  response.status(200).json({
    status: `Success`,
  });
});

export const renderApp = catchAsync(async (request, response) => {
  response.status(200).render(`Base`, {
    title: `Contact Form | Test`,
    errorMessage: '',
    successMessage: '',
  });
});
