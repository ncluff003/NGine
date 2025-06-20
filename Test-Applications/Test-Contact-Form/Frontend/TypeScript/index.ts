// use strict
import '../CSS/contact.css';
import { ngine } from '@purenspiration/ngine';

let viewport = new ngine.Frontend.Viewport();
console.log(
  viewport.watch((data) => {
    console.log(data);
  }),
);

(window as any).__VIEWPORT = viewport; // Expose viewport to the global window object for testing in Cypress.
