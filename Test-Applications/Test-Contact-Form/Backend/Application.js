//////////////////////////////////////
// 3rd Party Modules
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

//////////////////////////////////////
// Recreating __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//////////////////////////////////////
// 3rd Party Module Instances
const Application = express();

//////////////////////////////////////
// 3rd Party Configuration Files
console.log(path.resolve('./'));
console.log();
Application.set('view engine', 'pug');
Application.set('views', path.join(__dirname, 'Views'));
Application.use(express.static(path.resolve(`${__dirname}/../../`, `Test-Contact-Form`, `Dist/`)));
Application.use(express.json());

console.log(path.resolve(`${__dirname}/../../`, `Test-Contact-Form`, `Dist/`));

////////////////////////////////////////////
//  Routing Middleware
import applicationRouter from './Routes/ApplicationRoutes.js';

////////////////////////////////////////////
//  My Middleware
Application.use('/', applicationRouter);

////////////////////////////////////////////
//  Exporting App
export { Application };
