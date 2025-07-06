////////////////////////////////////////////////
// UTILITY IMPORTS
import './Utils/arrayMethods';

////////////////////////////////////////////////
// BACKEND IMPORTS

////////////////////////////////////////////////
// FRONTEND IMPORTS
import { Viewport } from './Frontend';

////////////////////////////////////////////////
// API TYPE & INTERFACE IMPORTS
export type { shapedViewportState } from './Frontend';

////////////////////////////////////////////////
// API EXPORTS
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
