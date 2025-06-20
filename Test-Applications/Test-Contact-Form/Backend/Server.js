////////////////////////////////////////////
//  My Modules
import { Application } from './Application.js';

////////////////////////////////////////////
//  Initialize Port Number
const PORT = process.env.PORT || 3333;

////////////////////////////////////////////
//  Start Server
const server = Application.listen(PORT, () => {
  console.log(`Application is listening on port ${PORT}`);
});

////////////////////////////////////////////
//  Reload App

////////////////////////////////////////////
//  Shut Down App On Unhandled Rejections
process.on(`unhandledRejection`, (error) => {
  console.log(`UNHANDLED REJECTION 💥 -- Shutting Down...`);
  console.error(error);
  server.close(() => {
    process.exit(1);
  });
});
