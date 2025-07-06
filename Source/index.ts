////////////////////////////////////////////////
// UTILITY IMPORTS
import './Utils/arrayMethods';

////////////////////////////////////////////////
// BACKEND IMPORTS

////////////////////////////////////////////////
// FRONTEND IMPORTS
import { Viewport } from './Frontend';

export const ngine: {
  Backend: object;
  Frontend: {
    Viewport: typeof Viewport;
  };
} = {
  Backend: {},
  Frontend: {
    Viewport,
  },
};
