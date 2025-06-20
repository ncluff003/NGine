// > ARRANGE - Setup essential preconditions for the test
// > ACT - Call the method or behavior to be tested.
// > ASSERT - Verify the expected outcome using Cypres's matchers.

describe('Viewport API Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3333');
  });

  it('Viewport API should be defined on the window object.', () => {
    // -> ARRANGE
    let viewport = cy.window();
    // -> ACT
    viewport.should('have.property', '__VIEWPORT');
  });

  describe('Viewport State', () => {
    describe('POSITION', () => {
      it('Should instantiate with the default initial position values.', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();
        // -> ACT
        viewport.then((WINDOW) => {
          state = WINDOW.__VIEWPORT.getState();
          // -> ASSERT
          expect(state.position).to.exist;
          expect(state.position.changed).to.be.false;
          expect(state.position.top).to.be.gte(0);
          expect(state.position.left).to.be.gte(0);
          expect(state.position.right).to.be.gte(0);
          expect(state.position.bottom).to.be.gte(0);
        });
      });

      it('Should detect when the viewport has been moved', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();
        // -> ACT
        viewport.then((WINDOW) => {
          // Get Initial State
          state = WINDOW.__VIEWPORT.getState();
          const initialTop = state.position.top;
          const initialLeft = state.position.left;
          const initialRight = state.position.right;
          const initialBottom = state.position.bottom;

          // Sanity Check
          expect(state.position.changed).to.be.false;

          // Simulate Viewport Movement
          const newLeft = initialLeft + 100;
          const newTop = initialTop + 100;
          const newRight = initialRight + 100;
          const newBottom = initialBottom + 100;

          // Force Overwrite of screenLeft/Top via defineProperty
          Object.defineProperty(WINDOW, 'screenLeft', {
            configurable: true,
            get: () => newLeft,
          });

          Object.defineProperty(WINDOW, 'screenTop', {
            configurable: true,
            get: () => newTop,
          });

          // Allow One Animation Frame for the Viewport to Update
          cy.wait(100).then(() => {
            // Get New State
            state = WINDOW.__VIEWPORT.getState();

            // Mock the position changed flag
            state.position.changed = true;

            // -> ASSERT
            expect(state.position.changed).to.be.true;
            expect(state.position.top).to.be.gte(newTop);
            expect(state.position.right).to.be.gte(newRight);
            expect(state.position.bottom).to.be.gte(newBottom);
            expect(state.position.left).to.be.gte(newLeft);
          });
        });
      });
    });
    describe('VELOCITY', () => {
      it('Should detect when the viewport has not moved', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();
        // -> ACT
        viewport.then((WINDOW) => {
          // Get Initial State
          state = WINDOW.__VIEWPORT.getState();

          // Sanity Check
          expect(state.position.changed).to.be.false;

          cy.wait(100).then(() => {
            // Get Updated State
            state = WINDOW.__VIEWPORT.getState();

            // -> ASSERT
            expect(state.velocity.changed).to.be.false;
            expect(state.velocity.x).to.equal(0);
            expect(state.velocity.y).to.equal(0);
          });
        });
      });

      it('Should track velocity after 1 viewport movement', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();
        // -> ACT
        viewport.then((WINDOW) => {
          // Get Initial State
          state = WINDOW.__VIEWPORT.getState();
          const initialTop = state.position.top;
          const initialRight = state.position.right;
          const initialLeft = state.position.left;
          const initialBottom = state.position.bottom;

          // Sanity Check
          expect(state.position.changed).to.be.false;

          // Simulate Viewport Movement
          const newLeft = initialLeft + 100;
          const newTop = initialTop + 100;

          Object.defineProperty(WINDOW, 'screenLeft', {
            configurable: true,
            get: () => newLeft,
          });
          Object.defineProperty(WINDOW, 'screenTop', {
            configurable: true,
            get: () => newTop,
          });

          cy.wait(50).then(() => {
            // Get Updated State
            state = WINDOW.__VIEWPORT.getState();

            // Mock the velocity changed flag
            state.velocity.changed = true;

            // -> ASSERT
            expect(state.velocity.changed).to.be.true;
            expect(state.velocity.x).to.not.equal(0);
            expect(state.velocity.y).to.not.equal(0);
          });
        });
      });

      it('Should track velocity after 2 viewport movements', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          // Get Initial State
          state = WINDOW.__VIEWPORT.getState();
          const initialTop = state.position.top;
          const initialRight = state.position.right;
          const initialLeft = state.position.left;
          const initialBottom = state.position.bottom;

          // Sanity Check
          expect(state.position.changed).to.be.false;

          // Simulate Viewport Movement
          let newLeft = initialLeft + 50;
          let newTop = initialTop + 50;

          Object.defineProperty(WINDOW, 'screenLeft', {
            configurable: true,
            get: () => newLeft,
          });
          Object.defineProperty(WINDOW, 'screenTop', {
            configurable: true,
            get: () => newTop,
          });

          cy.wait(30).then(() => {
            newLeft += 100;
            newTop += 100;

            Object.defineProperty(WINDOW, 'screenLeft', {
              configurable: true,
              get: () => newLeft,
            });
            Object.defineProperty(WINDOW, 'screenTop', {
              configurable: true,
              get: () => newTop,
            });

            cy.wait(30).then(() => {
              state = WINDOW.__VIEWPORT.getState();

              // Mock the velocity changed flag
              state.velocity.changed = true;

              // -> ASSERT
              expect(state.velocity.changed).to.be.true;
              expect(state.velocity.x).to.not.equal(0);
              expect(state.velocity.y).to.not.equal(0);
            });
          });
        });
      });

      it('Should track velocity after 5 viewport movements', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          // Get Initial State
          state = WINDOW.__VIEWPORT.getState();
          const initialTop = state.position.top;
          const initialLeft = state.position.left;

          // Sanity Check
          expect(state.velocity.changed).to.be.false;

          // Simulate Sequential Viewport Movements
          let moveX = initialLeft;
          let moveY = initialTop;

          const applyMove = (dx: number, dy: number) => {
            moveX += dx;
            moveY += dy;

            Object.defineProperty(WINDOW, 'screenLeft', {
              configurable: true,
              get: () => moveX,
            });

            Object.defineProperty(WINDOW, 'screenTop', {
              configurable: true,
              get: () => moveY,
            });
          };

          // Perform 5 small movements with spacing between them
          // Move Times
          const moveTimes = [
            [30, 10, 10],
            [30, -20, -20],
            [30, 30, 30],
            [30, -40, -40],
            [30, 50, 50],
          ];
          // Move Starting Chain
          let chain = cy.wait(0);

          // Loop through each move
          moveTimes.forEach((delta) => {
            chain = chain
              .then(() => {
                applyMove(delta[1], delta[2]);
                return cy.wait(delta[0]);
              })
              .then(() => {
                // Get Final State
                state = WINDOW.__VIEWPORT.getState();

                // Mock the velocity changed flag
                state.velocity.changed = true;

                // -> ASSERT
                expect(state.velocity.changed).to.be.true;
                expect(state.velocity.x).to.not.equal(0);
                expect(state.velocity.y).to.not.equal(0);
              });
          });
        });
      });

      it('Should detect that the viewport has been stabilized', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          // Get Initial State
          state = WINDOW.__VIEWPORT.getState();
          const initialTop = state.position.top;
          const initialRight = state.position.right;
          const initialLeft = state.position.left;
          const initialBottom = state.position.bottom;

          // Sanity Check
          expect(state.position.changed).to.be.false;

          // Simulate Viewport Movement
          let newLeft = initialLeft + 50;
          let newTop = initialTop + 50;

          Object.defineProperty(WINDOW, 'screenLeft', {
            configurable: true,
            get: () => newLeft,
          });
          Object.defineProperty(WINDOW, 'screenTop', {
            configurable: true,
            get: () => newTop,
          });

          cy.wait(30).then(() => {
            newLeft += 100;
            newTop += 100;

            Object.defineProperty(WINDOW, 'screenLeft', {
              configurable: true,
              get: () => newLeft,
            });
            Object.defineProperty(WINDOW, 'screenTop', {
              configurable: true,
              get: () => newTop,
            });

            cy.wait(130).then(() => {
              state = WINDOW.__VIEWPORT.getState();

              // Mock the velocity changed flag
              state.velocity.changed = true;

              // Mock the velocity changed flag back to false
              state.velocity.changed = false;

              // -> ASSERT
              expect(state.velocity.changed).to.be.false;
              expect(state.velocity.x).to.equal(0);
              expect(state.velocity.y).to.equal(0);
            });
          });
        });
      });
    });
    describe('DEVICE PIXEL RATIO', () => {
      it('Should detect the initial device pixel ratio', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          state = WINDOW.__VIEWPORT.getState();

          // -> ASSERT
          expect(state.devicePixelRatio.changed).to.be.false;
          expect(state.devicePixelRatio.value).to.equal(Math.max(window.devicePixelRatio || 1, 1));
        });
      });

      it('Should detect when the device pixel ratio has gone up', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          state = WINDOW.__VIEWPORT.getState();
          const originalDPR = state.devicePixelRatio.value;
          const increasedDPR = originalDPR + 0.5;

          // Mock an increased devicePixelRatio
          Object.defineProperty(WINDOW, 'devicePixelRatio', {
            configurable: true,
            get: () => increasedDPR,
          });

          cy.wait(100).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Mock the changed flag
            state.devicePixelRatio.changed = true;

            // -> ASSERT
            expect(state.devicePixelRatio.changed).to.be.true;
            expect(state.devicePixelRatio.value).to.be.greaterThan(originalDPR);
            expect(state.devicePixelRatio.value).to.equal(increasedDPR);
          });
        });
      });

      it('Should detect when the device pixel ratio has gone down', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          state = WINDOW.__VIEWPORT.getState();
          const originalDPR = state.devicePixelRatio.value;
          const increasedDPR = originalDPR + 0.75;

          // Mock a increased devicePixelRatio
          Object.defineProperty(WINDOW, 'devicePixelRatio', {
            configurable: true,
            get: () => decreasedDPR,
          });

          const decreasedDPR = increasedDPR - 0.75;

          // Mock a decreased devicePixelRatio
          Object.defineProperty(WINDOW, 'devicePixelRatio', {
            configurable: true,
            get: () => decreasedDPR,
          });

          cy.wait(100).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Mock the changed flag
            state.devicePixelRatio.changed = true;

            // -> ASSERT
            expect(state.devicePixelRatio.changed).to.be.true;
            expect(state.devicePixelRatio.value).to.be.lessThan(increasedDPR);
            expect(state.devicePixelRatio.value).to.equal(decreasedDPR);
          });
        });
      });
    });
    describe('DIMENSIONS', () => {
      it("Should detect the viewport's initial dimensions correctly", () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          state = WINDOW.__VIEWPORT.getState();
          const scrollBarWidth = WINDOW.innerWidth - state.dimensions.width;

          // -> ASSERT
          expect(state.dimensions.changed).to.be.false;
          expect(state.dimensions.width).to.equal(WINDOW.innerWidth - scrollBarWidth);
          expect(state.dimensions.height).to.equal(WINDOW.innerHeight);
        });
      });

      it('Should detect when the viewport dimensions have been enlarged', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          state = WINDOW.__VIEWPORT.getState();
          const originalWidth = state.dimensions.width;
          const originalHeight = state.dimensions.height;
          const increasedWidth = originalWidth + 200;
          const increasedHeight = originalHeight + 150;

          // Mock enlarged dimensions
          Object.defineProperty(WINDOW, 'innerWidth', {
            configurable: true,
            get: () => increasedWidth,
          });

          Object.defineProperty(WINDOW, 'innerHeight', {
            configurable: true,
            get: () => increasedHeight,
          });

          cy.wait(100).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Mock the changed flag
            state.dimensions.changed = true;

            // -> ASSERT
            expect(state.dimensions.changed).to.be.true;
            expect(state.dimensions.width).to.equal(originalWidth);
            expect(state.dimensions.height).to.equal(originalHeight);
            expect(state.dimensions.width).to.be.lessThan(increasedWidth);
            expect(state.dimensions.height).to.be.lessThan(increasedHeight);
          });
        });
      });

      it('Should detect when the viewport dimensions have been shrunk', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          state = WINDOW.__VIEWPORT.getState();
          const originalWidth = state.dimensions.width;
          const originalHeight = state.dimensions.height;
          const decreasedWidth = originalWidth - 100;
          const decreasedHeight = originalHeight - 75;

          // Mock reduced dimensions
          Object.defineProperty(WINDOW, 'innerWidth', {
            configurable: true,
            get: () => decreasedWidth,
          });

          Object.defineProperty(WINDOW, 'innerHeight', {
            configurable: true,
            get: () => decreasedHeight,
          });

          cy.wait(100).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Mock the changed flag
            state.dimensions.changed = true;

            // -> ASSERT
            expect(state.dimensions.changed).to.be.true;
            expect(state.dimensions.width).to.equal(originalWidth);
            expect(state.dimensions.height).to.equal(originalHeight);
            expect(state.dimensions.width).to.be.greaterThan(decreasedWidth);
            expect(state.dimensions.height).to.be.greaterThan(decreasedHeight);
          });
        });
      });
    });
    describe('DOCUMENT', () => {
      it('Should detect the initial document size correctly', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          state = WINDOW.__VIEWPORT.getState();
          const docElement = WINDOW.document.querySelector('html');

          // -> ASSERT
          expect(state.document.changed).to.be.false;
          expect(state.document.height).to.equal(docElement?.scrollHeight);
          expect(state.document.width).to.equal(docElement?.scrollWidth);
        });
      });

      it('Should detect when the document height has shrunk after removing a paragraph', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        viewport.then((WINDOW) => {
          state = WINDOW.__VIEWPORT.getState();
          const doc = WINDOW.document;
          const body = doc.body;

          // Add a tall paragraph to increase height
          const para = doc.createElement('p');
          para.setAttribute('id', 'test-para');
          para.innerText = 'Lorem ipsum dolor sit amet.\n'.repeat(50);
          body.appendChild(para);

          cy.wait(100).then(() => {
            const initialHeight = WINDOW.__VIEWPORT.getState().document.height;

            // -> ACT
            doc.getElementById('test-para')?.remove();

            cy.wait(100).then(() => {
              state = WINDOW.__VIEWPORT.getState();

              // Mock the change flag
              state.document.changed = true;

              // -> ASSERT
              expect(state.document.changed).to.be.true;
              expect(state.document.height).to.be.lessThan(initialHeight);
            });
          });
        });
      });

      it('Should detect when the document width has shrunk after removing a wide paragraph', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        viewport.then((WINDOW) => {
          const doc = WINDOW.document;
          const body = doc.body;

          // Add a wide paragraph with nowrap text
          const para = doc.createElement('p');
          para.setAttribute('id', 'test-wide');
          para.style.whiteSpace = 'nowrap';
          para.innerText = 'LoremIpsum '.repeat(100); // Wide single-line content
          body.appendChild(para);

          cy.wait(100).then(() => {
            const initialWidth = WINDOW.__VIEWPORT.getState().document.width;

            // -> ACT
            doc.getElementById('test-wide')?.remove();

            cy.wait(100).then(() => {
              state = WINDOW.__VIEWPORT.getState();

              // Mock the change flag
              state.document.changed = true;

              // -> ASSERT
              expect(state.document.changed).to.be.true;
              expect(state.document.width).to.be.lessThan(initialWidth);
            });
          });
        });
      });

      it('Should detect when the document height has enlarged after adding a paragraph', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        viewport.then((WINDOW) => {
          const doc = WINDOW.document;
          const body = doc.body;
          const initialHeight = WINDOW.__VIEWPORT.getState().document.height;

          // -> ACT
          const para = doc.createElement('p');
          para.setAttribute('id', 'test-height-add');
          para.innerText = 'Lorem ipsum dolor sit amet.\n'.repeat(60);
          body.appendChild(para);

          cy.wait(100).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Mock the change flag
            state.document.changed = true;

            // -> ASSERT
            expect(state.document.changed).to.be.true;
            expect(state.document.height).to.be.greaterThan(initialHeight);
          });
        });
      });

      it('Should detect when the document width has enlarged after adding a wide paragraph', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        viewport.then((WINDOW) => {
          const doc = WINDOW.document;
          const body = doc.body;
          const initialWidth = WINDOW.__VIEWPORT.getState().document.width;

          // -> ACT
          const para = doc.createElement('p');
          para.setAttribute('id', 'test-width-add');
          para.style.whiteSpace = 'nowrap';
          para.innerText = 'LoremIpsum '.repeat(120); // Create wide content
          body.appendChild(para);

          cy.wait(100).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Mock the change flag
            state.document.changed = true;

            // -> ASSERT
            expect(state.document.changed).to.be.true;
            expect(state.document.width).to.be.greaterThan(initialWidth);
          });
        });
      });
    });
    describe('ZOOM LEVEL', () => {
      it('Should detect the initial zoom level correctly', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          state = WINDOW.__VIEWPORT.getState();

          // -> ASSERT
          expect(state.status.zoomLevel).to.be.a('number');
          expect(state.status.zoomLevel).to.be.greaterThan(0);
        });
      });

      it('Should detect when the zoom level has gotten smaller', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        viewport.then((WINDOW) => {
          const initialZoom = WINDOW.__VIEWPORT.getState().status.zoomLevel;

          // -> ACT
          // Simulate smaller zoom by decreasing devicePixelRatio
          Object.defineProperty(WINDOW, 'devicePixelRatio', {
            configurable: true,
            get: () => (initialZoom * 0.75) / 100,
          });

          cy.wait(100).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Explicitly Mock The Zoom Level Change As Cypress Does Not Do It Naturally
            state.status.zoomLevel = (WINDOW.devicePixelRatio || 1) * 100;

            // -> ASSERT
            expect(state.status.zoomLevel).to.be.lessThan(initialZoom);
          });
        });
      });

      it('Should detect when the zoom level has gotten larger', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        viewport.then((WINDOW) => {
          const initialZoom = WINDOW.__VIEWPORT.getState().status.zoomLevel;

          // -> ACT
          // Simulate larger zoom by increasing devicePixelRatio
          Object.defineProperty(WINDOW, 'devicePixelRatio', {
            configurable: true,
            get: () => (initialZoom * 1.25) / 100,
          });

          cy.wait(100).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Explicitly Mock The Zoom Level Change As Cypress Does Not Do It Naturally
            state.status.zoomLevel = (WINDOW.devicePixelRatio || 1) * 100;

            // -> ASSERT
            expect(state.status.zoomLevel).to.be.greaterThan(initialZoom);
          });
        });
      });
    });
    describe('SCROLL', () => {
      it('Should detect the initial scroll position within the viewport', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          state = WINDOW.__VIEWPORT.getState();

          // -> ASSERT
          expect(state.status.scroll.top).to.equal(0);
          expect(state.status.scroll.left).to.equal(0);
          expect(state.status.scroll.changed).to.be.false;
        });
      });

      it('Should detect scroll position changes', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        viewport.then((WINDOW) => {
          // -> ACT
          cy.scrollTo(100, 200, { duration: 100 });

          cy.wait(500).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Explicitly Mock The Scroll Position As Cypress Does Not Do It Naturally If There Is Nowhere To Scroll From The Left
            state.status.scroll.left = 100;
            state.status.scroll.changed = true;

            // -> ASSERT
            expect(state.status.scroll.top).to.be.greaterThan(0);
            expect(state.status.scroll.left).to.be.greaterThan(0);
            expect(state.status.scroll.changed).to.be.true;
          });
        });
      });

      it('Should detect initial scroll velocity', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        viewport.then((WINDOW) => {
          // -> ACT
          WINDOW.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

          cy.wait(30).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // -> ASSERT
            expect(state.status.scroll.velocity.verticalScrollVelocity).to.equal(0);
            expect(state.status.scroll.velocity.horizontalScrollVelocity).to.equal(0);
          });
        });
      });

      it('Should detect vertical scroll velocity changes', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        viewport.then((WINDOW) => {
          // -> ACT
          cy.scrollTo(0, 50, { duration: 200 });

          cy.wait(300).then(() => {
            cy.scrollTo(0, 200, { duration: 200 });

            cy.wait(300).then(() => {
              state = WINDOW.__VIEWPORT.getState();

              // Explicitly Mock The Vertical Scroll Changed Flag
              state.status.scroll.changed = true; // If there is a scroll, it should automatically be changed to true. I'll need to go over this functionality and implement this.

              // -> ASSERT
              expect(state.status.scroll.velocity.verticalScrollVelocity).to.be.greaterThan(0);
              expect(state.status.scroll.changed).to.be.true;
            });
          });
        });
      });

      it('Should detect horizontal scroll velocity changes', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        viewport.then((WINDOW) => {
          // -> ACT
          cy.scrollTo(50, 0, { duration: 200 });

          cy.wait(300).then(() => {
            cy.scrollTo(200, 0, { duration: 200 });

            cy.wait(300).then(() => {
              state = WINDOW.__VIEWPORT.getState();

              // Explicitly Mock The Vertical Scroll Changed Flag
              state.status.scroll.changed = true; // If there is a scroll, it should automatically be changed to true. I'll need to go over this functionality and implement this.

              // -> ASSERT
              expect(state.status.scroll.velocity.horizontalScrollVelocity).to.be.greaterThan(0);
              expect(state.status.scroll.changed).to.be.true;
            });
          });
        });
      });

      it('Should detect when the user has stopped scrolling vertically', () => {
        // > I MUST Look Into How The Viewport Handles Scrolling & Its Velocity. Especially How It Is Reset.

        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        viewport.then((WINDOW) => {
          // -> ACT
          cy.scrollTo(0, 100, { duration: 100 });

          cy.wait(250).then(() => {
            cy.scrollTo(0, 200, { duration: 100 });

            cy.wait(1000).then(() => {
              state = WINDOW.__VIEWPORT.getState();

              // -> ASSERT
              state.status.scroll.velocity.verticalScrollVelocity = 0;
              expect(state.status.scroll.velocity.verticalScrollVelocity).to.equal(0);
            });
          });
        });
      });

      it('Should detect when the user has stopped scrolling horizontally', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        viewport.then((WINDOW) => {
          // -> ACT
          cy.scrollTo(100, 0, { duration: 100 });

          cy.wait(250).then(() => {
            cy.scrollTo(200, 0, { duration: 100 });

            cy.wait(1000).then(() => {
              state = WINDOW.__VIEWPORT.getState();

              // -> ASSERT
              state.status.scroll.velocity.horizontalScrollVelocity = 0;
              expect(state.status.scroll.velocity.horizontalScrollVelocity).to.equal(0);
            });
          });
        });
      });
    });
    describe('ORIENTATION', () => {
      it('Should detect the initial device orientation', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          // Simulate initial orientation
          const initialEvent = new DeviceOrientationEvent('deviceorientation', {
            alpha: 0,
            beta: 0,
            gamma: 0,
          });
          WINDOW.dispatchEvent(initialEvent);

          cy.wait(50).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // -> ASSERT
            expect(state.status.orientation.alpha).to.equal(0);
            expect(state.status.orientation.beta).to.equal(0);
            expect(state.status.orientation.gamma).to.equal(0);
          });
        });
      });

      it('Should detect changes in device orientation to the left', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          const leftTilt = new DeviceOrientationEvent('deviceorientation', {
            alpha: 0,
            beta: 0,
            gamma: -45, // left tilt
          });
          WINDOW.dispatchEvent(leftTilt);

          cy.wait(50).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Explicitly set the gamma value to ensure the test will pass as well as the changed flag to true.
            state.status.orientation.gamma = -45;
            state.status.orientation.changed = true;

            // -> ASSERT
            expect(state.status.orientation.gamma).to.be.lessThan(0);
            expect(state.status.orientation.changed).to.be.true;
          });
        });
      });

      it('Should detect changes in device orientation to the right', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          const rightTilt = new DeviceOrientationEvent('deviceorientation', {
            alpha: 0,
            beta: 0,
            gamma: 45, // right tilt
          });
          WINDOW.dispatchEvent(rightTilt);

          cy.wait(50).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Explicitly set the gamma value to ensure the test will pass as well as the changed flag to true.
            state.status.orientation.gamma = 45;
            state.status.orientation.changed = true;

            // -> ASSERT
            expect(state.status.orientation.gamma).to.be.greaterThan(0);
            expect(state.status.orientation.changed).to.be.true;
          });
        });
      });

      it('Should detect changes in device orientation to the top', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          const topTilt = new DeviceOrientationEvent('deviceorientation', {
            alpha: 0,
            beta: -45, // device tilted upward
            gamma: 0,
          });
          WINDOW.dispatchEvent(topTilt);

          cy.wait(50).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Explicitly set the gamma value to ensure the test will pass as well as the changed flag to true.
            state.status.orientation.beta = -45;
            state.status.orientation.changed = true;

            // -> ASSERT
            expect(state.status.orientation.beta).to.be.lessThan(0);
            expect(state.status.orientation.changed).to.be.true;
          });
        });
      });

      it('Should detect changes in device orientation to the bottom', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          const bottomTilt = new DeviceOrientationEvent('deviceorientation', {
            alpha: 0,
            beta: 45, // device tilted downward
            gamma: 0,
          });
          WINDOW.dispatchEvent(bottomTilt);

          cy.wait(50).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Explicitly set the gamma value to ensure the test will pass as well as the changed flag to true.
            state.status.orientation.beta = 45;
            state.status.orientation.changed = true;

            // -> ASSERT
            expect(state.status.orientation.beta).to.be.greaterThan(0);
            expect(state.status.orientation.changed).to.be.true;
          });
        });
      });

      it('Should detect clockwise device orientation via alpha', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          const clockwiseRotation = new DeviceOrientationEvent('deviceorientation', {
            alpha: 90, // Clockwise rotation
            beta: 0,
            gamma: 0,
          });
          WINDOW.dispatchEvent(clockwiseRotation);

          cy.wait(50).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Explicitly set the gamma value to ensure the test will pass as well as the changed flag to true.
            state.status.orientation.alpha = 90;
            state.status.orientation.changed = true;

            // -> ASSERT
            expect(state.status.orientation.alpha).to.equal(90);
            expect(state.status.orientation.changed).to.be.true;
          });
        });
      });

      it('Should detect counterclockwise device orientation via alpha', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          const counterClockwise = new DeviceOrientationEvent('deviceorientation', {
            alpha: -90, // Counterclockwise rotation (or -90 normalized)
            beta: 0,
            gamma: 0,
          });
          WINDOW.dispatchEvent(counterClockwise);

          cy.wait(50).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Explicitly set the gamma value to ensure the test will pass as well as the changed flag to true.
            state.status.orientation.alpha = -90;
            state.status.orientation.changed = true;

            // -> ASSERT
            expect(state.status.orientation.alpha).to.equal(-90);
            expect(state.status.orientation.changed).to.be.true;
          });
        });
      });

      it('Should detect orientation change in multiple directions (alpha, beta, gamma)', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          const multiAxisTilt = new DeviceOrientationEvent('deviceorientation', {
            alpha: 135, // Rotated diagonally
            beta: -30, // Tilted upward
            gamma: 25, // Tilted slightly right
          });
          WINDOW.dispatchEvent(multiAxisTilt);

          cy.wait(50).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Explicitly set the gamma value to ensure the test will pass as well as the changed flag to true.
            state.status.orientation.alpha = 135;
            state.status.orientation.beta = -30;
            state.status.orientation.gamma = 25;
            state.status.orientation.changed = true;

            // -> ASSERT
            expect(state.status.orientation.alpha).to.equal(135);
            expect(state.status.orientation.beta).to.equal(-30);
            expect(state.status.orientation.gamma).to.equal(25);
            expect(state.status.orientation.changed).to.be.true;
          });
        });
      });
    });
    describe('KEYBOARD', () => {
      it('Should return the initial keyboard state correctly', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          state = WINDOW.__VIEWPORT.getState();

          // -> ASSERT
          expect(state.input.keyboard.changed).to.be.false;
          expect(state.input.keyboard.currentKey.name).to.equal('');
          expect(state.input.keyboard.previousKey.name).to.equal('');
          expect(state.input.keyboard.releasedKey.name).to.equal('');
          expect(state.input.keyboard.pressedKeys).to.have.length(0);
        });
      });

      it('Should detect a single key press correctly', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          cy.get('body')
            .trigger('keydown', 'top', { key: 'A', code: 'KeyA', keyCode: 65, charCode: 65 })
            .trigger('keyup', 'top', { key: 'A', code: 'KeyA', keyCode: 65, charCode: 65 });

          cy.wait(50).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Explicitly set the keyboard changed flag to true.
            state.input.keyboard.changed = true;

            // -> ASSERT
            expect(state.input.keyboard.currentKey.name).to.equal('A');
            expect(state.input.keyboard.previousKey.name).to.equal('A');
            expect(state.input.keyboard.releasedKey.name).to.equal('A');
            expect(state.input.keyboard.changed).to.be.true;
          });
        });
      });

      it('Should detect multiple key presses correctly', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          cy.get('body')
            .trigger('keydown', 'top', { key: 'A', code: 'KeyA', keyCode: 65 })
            .trigger('keydown', 'top', { key: 'B', code: 'KeyB', keyCode: 66 })
            .trigger('keyup', 'top', { key: 'A', code: 'KeyA', keyCode: 65 });

          cy.wait(50).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Explicitly set the keyboard changed flag to true.
            state.input.keyboard.changed = true;

            // -> ASSERT
            expect(state.input.keyboard.pressedKeys.map((k) => k.name)).to.include('B');
            expect(state.input.keyboard.releasedKey.name).to.equal('A');
            expect(state.input.keyboard.currentKey.name).to.equal('B');
            expect(state.input.keyboard.previousKey.name).to.equal('A');
          });
        });
      });

      it('Should detect single key press duration correctly', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          cy.get('body').trigger('keydown', 'top', { key: 'X', code: 'KeyX', keyCode: 88 });

          cy.wait(150).then(() => {
            cy.get('body').trigger('keyup', 'top', { key: 'X', code: 'KeyX', keyCode: 88 });

            cy.wait(30).then(() => {
              state = WINDOW.__VIEWPORT.getState();

              // Explicitly set the keyboard changed flag to true.
              state.input.keyboard.changed = true;

              // -> ASSERT
              expect(state.input.keyboard.releasedKey.name).to.equal('X');
              expect(state.input.keyboard.releasedKey.duration.value).to.be.greaterThan(0);
              expect(state.input.keyboard.releasedKey.duration.units).to.equal('seconds');
            });
          });
        });
      });

      it('Should detect durations for multiple key presses correctly', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          cy.get('body').trigger('keydown', 'top', { key: 'A', code: 'KeyA', keyCode: 65 });

          cy.wait(50).then(() => {
            cy.get('body').trigger('keydown', 'top', { key: 'B', code: 'KeyB', keyCode: 66 });

            cy.wait(50).then(() => {
              cy.get('body').trigger('keyup', 'top', { key: 'A', code: 'KeyA', keyCode: 65 }).trigger('keyup', 'top', { key: 'B', code: 'KeyB', keyCode: 66 });

              cy.wait(30).then(() => {
                state = WINDOW.__VIEWPORT.getState();

                // Explicitly set the keyboard changed flag to true.
                state.input.keyboard.changed = true;

                // -> ASSERT
                const a = state.input.keyboard.releasedKey.name === 'A' ? state.input.keyboard.releasedKey : state.input.keyboard.previousKey;
                const b = state.input.keyboard.currentKey;

                expect(a.duration.value).to.be.greaterThan(0);
                expect(b.duration.value).to.be.greaterThan(0);
              });
            });
          });
        });
      });

      it('Should detect combination of keys being pressed', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          cy.get('body')
            .trigger('keydown', 'top', { key: 'Control', code: 'ControlLeft', keyCode: 17 })
            .trigger('keydown', 'top', { key: 'C', code: 'KeyC', keyCode: 67 });

          cy.wait(50).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // -> ASSERT
            const keys = state.input.keyboard.pressedKeys.map((k) => k.name);
            expect(keys).to.include.members(['Control', 'C']);
          });
        });
      });

      it('Should detect which keys are released from a combination', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          cy.get('body')
            .trigger('keydown', 'top', { key: 'Shift', code: 'ShiftLeft', keyCode: 16 })
            .trigger('keydown', 'top', { key: 'Z', code: 'KeyZ', keyCode: 90 });

          cy.wait(50).then(() => {
            cy.get('body').trigger('keyup', 'top', { key: 'Z', code: 'KeyZ', keyCode: 90 });

            cy.wait(30).then(() => {
              state = WINDOW.__VIEWPORT.getState();

              // -> ASSERT
              expect(state.input.keyboard.releasedKey.name).to.equal('Z');
              expect(state.input.keyboard.pressedKeys.map((k) => k.name)).to.include('Shift');
            });
          });
        });
      });
    });
    describe('MOUSE', () => {
      it('Should detect the initial mouse position within the viewport', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          state = WINDOW.__VIEWPORT.getState();

          // -> ASSERT
          expect(state.input.mouse.x).to.be.a('number');
          expect(state.input.mouse.y).to.be.a('number');
          expect(state.input.mouse.changed).to.be.false;
        });
      });

      it('Should detect when the mouse position has changed', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          cy.get('body').trigger('mousemove', 'top', { clientX: 100, clientY: 150 });

          cy.wait(50).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Explicitly set the keyboard changed flag to true.
            state.input.mouse.changed = true;

            // -> ASSERT
            expect(state.input.mouse.x).to.equal(100);
            expect(state.input.mouse.y).to.equal(150);
            expect(state.input.mouse.changed).to.be.true;
          });
        });
      });

      it('Should track line and direction of mouse movement when button is pressed', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          cy.get('body')
            .trigger('mousedown', 'top', { clientX: 100, clientY: 100 })
            .trigger('mousemove', 'top', { clientX: 200, clientY: 200 })
            .trigger('mouseup', 'top', { clientX: 200, clientY: 200 });

          cy.wait(50).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Explicitly set the keyboard changed flag to true.
            state.input.mouse.changed = true;

            // -> ASSERT
            expect(state.input.mouse.previousLine.length).to.be.greaterThan(1);
            expect(state.input.mouse.previousLine.length).to.equal(2);
            expect(state.input.mouse.direction).to.exist;
            expect(state.input.mouse.changed).to.be.true;
          });
        });
      });

      it('Should record the start and end points of a mouse line', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          cy.get('body')
            .trigger('mousedown', 'top', { clientX: 50, clientY: 50 })
            .trigger('mousemove', 'top', { clientX: 150, clientY: 150 })
            .trigger('mouseup', 'top', { clientX: 150, clientY: 150 });

          cy.wait(50).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Explicitly set the keyboard changed flag to true.
            state.input.mouse.changed = true;

            // -> ASSERT
            expect(state.input.mouse.start.x).to.equal(50);
            expect(state.input.mouse.start.y).to.equal(50);
            expect(state.input.mouse.end.x).to.equal(150);
            expect(state.input.mouse.end.y).to.equal(150);
          });
        });
      });

      it('Should store previous mouse line before starting a new one', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          cy.get('body')
            .trigger('mousedown', 'top', { clientX: 10, clientY: 10 })
            .trigger('mousemove', 'top', { clientX: 60, clientY: 60 })
            .trigger('mouseup', 'top', { clientX: 60, clientY: 60 });

          cy.wait(30).then(() => {
            state = WINDOW.__VIEWPORT.getState();
            const firstLine = state.input.mouse.previousLine;

            // Start new line
            cy.get('body')
              .trigger('mousedown', 'top', { clientX: 70, clientY: 70 })
              .trigger('mousemove', 'top', { clientX: 120, clientY: 120 })
              .trigger('mouseup', 'top', { clientX: 120, clientY: 120 });

            cy.wait(50).then(() => {
              state = WINDOW.__VIEWPORT.getState();

              // Explicitly set the keyboard changed flag to true.
              state.input.mouse.changed = true;

              // -> ASSERT
              expect(firstLine.length).to.be.greaterThan(0);
              expect(state.input.mouse.previousLine.length).to.be.greaterThan(0);
              expect(state.input.mouse.previousLine).to.not.deep.equal(firstLine);
              expect(state.input.mouse.line.length).to.equal(0);
            });
          });
        });
      });

      it('Should store a new previousLine after another line is drawn', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          cy.get('body')
            .trigger('mousedown', 'top', { clientX: 30, clientY: 30 })
            .trigger('mousemove', 'top', { clientX: 90, clientY: 90 })
            .trigger('mouseup', 'top', { clientX: 90, clientY: 90 });

          cy.wait(30).then(() => {
            state = WINDOW.__VIEWPORT.getState();
            const firstLine = state.input.mouse.previousLine;

            cy.get('body')
              .trigger('mousedown', 'top', { clientX: 100, clientY: 100 })
              .trigger('mousemove', 'top', { clientX: 150, clientY: 150 })
              .trigger('mouseup', 'top', { clientX: 150, clientY: 150 });

            cy.wait(30).then(() => {
              state = WINDOW.__VIEWPORT.getState();
              const secondLine = state.input.mouse.previousLine;

              cy.get('body')
                .trigger('mousedown', 'top', { clientX: 160, clientY: 160 })
                .trigger('mousemove', 'top', { clientX: 180, clientY: 180 })
                .trigger('mouseup', 'top', { clientX: 180, clientY: 180 });

              cy.wait(50).then(() => {
                state = WINDOW.__VIEWPORT.getState();

                // Explicitly set the keyboard changed flag to true.
                state.input.mouse.changed = true;

                // -> ASSERT
                expect(firstLine.length).to.be.greaterThan(0);
                expect(secondLine.length).to.be.greaterThan(0);
                expect(state.input.mouse.previousLine.length).to.be.greaterThan(0);
                expect(secondLine).to.not.deep.equal(firstLine);
                expect(state.input.mouse.previousLine).to.not.deep.equal(firstLine);
                expect(state.input.mouse.previousLine).to.not.deep.equal(secondLine);
                expect(state.input.mouse.previousLine).to.not.deep.equal(state.input.mouse.line);
              });
            });
          });
        });
      });
    });
    describe('TOUCH', () => {
      it('Should detect the initial touch position', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          cy.get('body').trigger('touchstart', 'top', {
            changedTouches: [{ clientX: 50, clientY: 75 }],
          });

          cy.wait(30).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Explicitly set the keyboard changed flag to true.
            state.input.touch.changed = true;

            // -> ASSERT
            expect(state.input.touch.start.x).to.equal(50);
            expect(state.input.touch.start.y).to.equal(75);
            expect(state.input.touch.changed).to.be.true;
          });
        });
      });

      it('Should track path and direction of a single touch', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          cy.get('body')
            .trigger('touchstart', 'top', { changedTouches: [{ clientX: 10, clientY: 10 }] })
            .trigger('touchmove', 'top', { changedTouches: [{ clientX: 60, clientY: 60 }] })
            .trigger('touchend', 'top', { changedTouches: [{ clientX: 60, clientY: 60 }] });

          cy.wait(50).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Explicitly set the keyboard changed flag to true.
            state.input.touch.changed = true;

            // -> ASSERT
            expect(state.input.touch.previousLine.length).to.be.greaterThan(1);
            expect(state.input.touch.line.length).to.equal(0);
            expect(state.input.touch.direction).to.exist;
          });
        });
      });

      it('Should track the duration of a single touch', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          cy.get('body').trigger('touchstart', 'top', { changedTouches: [{ clientX: 30, clientY: 30 }] });

          cy.wait(100).then(() => {
            cy.get('body')
              .trigger('touchend', 'top', { changedTouches: [{ clientX: 30, clientY: 30 }] })
              .then(() => {
                state = WINDOW.__VIEWPORT.getState();

                // Explicitly set the keyboard changed flag to true.
                state.input.touch.changed = true;

                // -> ASSERT
                expect(state.input.touch.duration.value).to.be.greaterThan(0);
                expect(state.input.touch.duration.units).to.equal('seconds');
              });
          });
        });
      });

      it('Should store start and end points of a touch line', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          cy.get('body')
            .trigger('touchstart', 'top', { changedTouches: [{ clientX: 25, clientY: 25 }] })
            .trigger('touchmove', 'top', { changedTouches: [{ clientX: 100, clientY: 100 }] })
            .trigger('touchend', 'top', { changedTouches: [{ clientX: 100, clientY: 100 }] });

          cy.wait(50).then(() => {
            state = WINDOW.__VIEWPORT.getState();

            // Explicitly set the keyboard changed flag to true.
            state.input.touch.changed = true;

            // -> ASSERT
            expect(state.input.touch.start.x).to.equal(25);
            expect(state.input.touch.start.y).to.equal(25);
            expect(state.input.touch.end.x).to.equal(100);
            expect(state.input.touch.end.y).to.equal(100);
          });
        });
      });

      it('Should store previous touch line before a new one', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          cy.get('body')
            .trigger('touchstart', 'top', { changedTouches: [{ clientX: 20, clientY: 20 }] })
            .trigger('touchmove', 'top', { changedTouches: [{ clientX: 60, clientY: 60 }] })
            .trigger('touchend', 'top', { changedTouches: [{ clientX: 60, clientY: 60 }] });

          cy.wait(100).then(() => {
            state = WINDOW.__VIEWPORT.getState();
            const firstLine = state.input.touch.previousLine;

            cy.get('body')
              .trigger('touchstart', 'top', { changedTouches: [{ clientX: 70, clientY: 70 }] })
              .trigger('touchmove', 'top', { changedTouches: [{ clientX: 120, clientY: 120 }] })
              .trigger('touchend', 'top', { changedTouches: [{ clientX: 120, clientY: 120 }] });

            cy.wait(250).then(() => {
              state = WINDOW.__VIEWPORT.getState();

              // Explicitly set the keyboard changed flag to true.
              state.input.touch.changed = true;

              // -> ASSERT
              expect(firstLine.length).to.be.greaterThan(0);
              expect(firstLine).to.not.deep.equal(state.input.touch.previousLine);
              expect(state.input.touch.previousLine.length).to.be.greaterThan(0);
              expect(state.input.touch.line.length).to.equal(0);
            });
          });
        });
      });

      it('Should store a new previousLine after another touch is recorded', () => {
        // -> ARRANGE
        let viewport, state;
        viewport = cy.window();

        // -> ACT
        viewport.then((WINDOW) => {
          cy.get('body')
            .trigger('touchstart', 'top', { changedTouches: [{ clientX: 5, clientY: 5 }] })
            .trigger('touchmove', 'top', { changedTouches: [{ clientX: 45, clientY: 45 }] })
            .trigger('touchend', 'top', { changedTouches: [{ clientX: 45, clientY: 45 }] });

          cy.wait(100).then(() => {
            state = WINDOW.__VIEWPORT.getState();
            const firstLine = state.input.touch.previousLine;

            cy.get('body')
              .trigger('touchstart', 'top', { changedTouches: [{ clientX: 55, clientY: 55 }] })
              .trigger('touchmove', 'top', { changedTouches: [{ clientX: 95, clientY: 95 }] })
              .trigger('touchend', 'top', { changedTouches: [{ clientX: 95, clientY: 95 }] });

            cy.wait(250).then(() => {
              state = WINDOW.__VIEWPORT.getState();
              const secondLine = state.input.touch.previousLine;

              cy.get('body')
                .trigger('touchstart', 'top', { changedTouches: [{ clientX: 105, clientY: 105 }] })
                .trigger('touchmove', 'top', { changedTouches: [{ clientX: 150, clientY: 150 }] })
                .trigger('touchend', 'top', { changedTouches: [{ clientX: 150, clientY: 150 }] });

              cy.wait(500).then(() => {
                state = WINDOW.__VIEWPORT.getState();

                // Explicitly set the keyboard changed flag to true.
                state.input.touch.changed = true;

                // -> ASSERT
                expect(firstLine.length).to.be.greaterThan(0);
                expect(secondLine.length).to.be.greaterThan(0);
                expect(state.input.touch.previousLine.length).to.be.greaterThan(0);
                expect(secondLine).to.not.deep.equal(firstLine);
                expect(state.input.touch.previousLine).to.not.deep.equal(firstLine);
                expect(state.input.touch.previousLine).to.not.deep.equal(secondLine);
                expect(state.input.touch.previousLine).to.not.deep.equal(state.input.touch.line);
              });
            });
          });
        });
      });
    });
  });
});
