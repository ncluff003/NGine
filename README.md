<h1 align="center"style="font-size: 2.5rem; padding: 0 0 1rem"><img src="./ngine.svg" style="height: auto; width: 3.5rem;" /> NGine.js</h1>
<h3 align="center" style="font-weight: lighter; padding: 0 0 .5rem;">
  🚀 A thoughtful, modular, and high-octane JavaScript API library designed and built for modern web development.
</h3>

> As a developer, finding tools that are intuitive, well thought out, and easy to use is hard enough to come across as it is. Add the requirement of finding highly specialized and powerful tools to work with and it becomes daunting.</p>

> Ultimately, the work done on NGine is aimed to help solve that very issue. At its core, NGine is thoughtfully constructed to simplify and accelerate modern web development.

> That goal is an ambitious one, and I am just beginning with the very first API built into NGine. However, I hope the tools that NGine provides makes it possible for developers everywhere to focus on what they do best, namely, innovate and engineer cutting edge software and user-experiences.

<br>

![npm](https://img.shields.io/npm/v/@purenspiration/ngine)
![license](https://img.shields.io/npm/l/@purenspiration/ngine)

<!-- ![CI](https://img.shields.io/github/actions/workflow/status/your-org/ngine/test.yml) -->

## Table Of Contents

- [Table Of Contents](#table-of-contents)
- [Technologies Used (`Including Versions`)](#technologies-used-including-versions)
- [Getting Started](#getting-started)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Basic Usage](#basic-usage)
    - [Importing NGine](#importing-ngine)
- [🔧 APIS](#-apis)
  - [🖥️ Viewport](#️-viewport)
    - [`watch`](#watch)
    - [`unwatch`](#unwatch)
    - [`getState`](#getstate)
    - [`reCalibrateOrientation`](#recalibrateorientation)
    - [Returned State Object](#returned-state-object)
- [Stuck \& Need Help?](#stuck--need-help)
- [Trouble With Errors?](#trouble-with-errors)
- [Known Issues](#known-issues)
  - [`Errors In Development`](#errors-in-development)
  - [`Error Backlog`](#error-backlog)
- [APIs In Development](#apis-in-development)
  - [API Status \& Information Table](#api-status--information-table)
- [💝 Support NGine](#-support-ngine)

## Technologies Used (`Including Versions`)

| Technology | Version |
| :--------: | :-----: |
| TypeScript |  5.8.3  |
|  Node.js   | 22.14.0 |
|  Webpack   | 5.99.8  |
|  Cypress   | 14.3.3  |
|    Jest    | 29.7.0  |

## Getting Started

### Requirements

NGine requires Node 22+ to be able to be used within a project.

Also, while it is compiled to hopefully be able to work with most workspaces, it is recommended to utilize packages that are compatible with the technologies listed above that are used within NGine in order to have the best results.

### Installation

Installation itself is very straightforward. Run the following command in your command line.

```bash
  npm install @purenspiration/ngine
```

### Basic Usage

#### Importing NGine

In order to use NGine, you will need to import it as such:

```
import { ngine } from '@purenspiration/ngine';
```

This will give you access to the following two properties:

| Property |       APIS Available On Property        |
| :------: | :-------------------------------------: |
| Backend  | None (`This will change in the future`) |
| Frontend |          [Viewport](#viewport)          |

Each API should be a Class, so the following will create an instance of the API. Using the Viewport API as an example, you begin to use it in the following way.

```
const viewport = new ngine.Frontend.Viewport();
```

You may be able to utilize more modern techniques such as:

```
import { ngine } from '@purenspiration/ngine';

const { Viewport } from ngine.Frontend;

const viewport = new Viewport();
```

## 🔧 APIS

<table><tr><td>Backend APIs</td></tr></table>

> There are currently no backend focused APIs at the moment. I fully intend to have some built in the future.

<table><tr><td>Frontend APIs</td></tr></table>

> There is only this one frontend focused API at the moment. However, I fully intend on having more built in the future.

### 🖥️ Viewport

Once the your new viewport instance is created, you will have access to the following methods:

> 1. watch
> 2. unwatch
> 3. getState
> 4. reCalibrateOrientation

#### `watch`

This is how to utilize the `watch` method.

```
 // previous code

const viewport = new Viewport();

viewport.watch((data) => {
  // your code here
})
```

As seen, the `watch` method takes a callback function that will pass the viewport state, or `data` in this case into whatever code you implement within the area labeled as `your code here`.

#### `unwatch`

This is how to utilize the `unwatch` method.

```
// previous code

const viewport = new Viewport();

viewport.unwatch((data) => {
  // your code here
})
```

Effectively, as the Viewport adds each watched function into a callback queue, the `unwatch` method will remove the matching callback to the one passed to it from the queue.

#### `getState`

This is how the `getState` method is utilized:

```
// previous code

const viewport = new Viewport();

viewport.getState();

// any future code
```

With the `getState` method, the Viewport's state can be accessed at any time. However, the main focus is on the watched functions.

The differences are that the `getState` method will only get a one time snapshot of the state at that given time. Any function being watched by the `watch` method is considered to be subscribed, and therefore, will run whenever the Viewport state changes.

#### `reCalibrateOrientation`

This is how the `reCalibrateOrientation` is utilized:

```
// previous code

const viewport = new Viewport();

viewport.reCalibrateOrientation();

// any future code
```

The `reCalibrateOrientation` method can be utilized anytime to reset the orientation to the default position. It returns an object that contains the previous and incoming calibrated positions.

#### Returned State Object

The returned state object will look similarly to the following except that this shows the type of values you will receive:

```
  {
    position: {
      changed: boolean;
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    devicePixelRatio: {
      changed: boolean;
      value: number;
    };
    velocity: {
      changed: boolean;
      x: number;
      y: number;
    };
    dimensions: {
      changed: boolean;
      height: number;
      width: number;
    };
    document: {
      changed: boolean;
      height: number;
      width: number;
    };
    status: {
      zoomLevel: number;
      orientation: {
        changed: boolean;
        alpha: number;
        beta: number;
        gamma: number;
      };
      scroll: {
        changed: boolean;
        top: number;
        right: number;
        bottom: number;
        left: number;
        velocity: {
          horizontalScrollVelocity: number;
          verticalScrollVelocity: number;
        };
      };
    };
    input: {
      keyboard: {
        changed: boolean;
        previousKey: {
          code: number | undefined;
          name: string | undefined;
          characterCode: number | undefined;
          info: string | undefined;
          duration: {
            value: number | undefined;
            units: string | undefined;
          }
        }
        currentKey: {
          code: number | undefined;
          name: string | undefined;
          characterCode: number | undefined;
          info: string | undefined;
          duration: {
            value: number | undefined;
            units: string | undefined;
          }
        }
        releasedKey: {
          code: number | undefined;
          name: string | undefined;
          characterCode: number | undefined;
          info: string | undefined;
          duration: {
            value: number | undefined;
            units: string | undefined;
          }
        }
        pressedKeys: {
          code: number | undefined;
          name: string | undefined;
          characterCode: number | undefined;
          info: string | undefined;
          duration: {
            value: number | undefined;
            units: string | undefined;
          }
        }[]
      };
      mouse: {
        changed: boolean;
        direction: string | undefined;
        x: number;
        y: number;
        duration: {
          value: number;
          units: string;
        };
        velocity: {
          x: number;
          y: number;
        };
        previousLine: {
          x: number;
          y: number;
          withinViewport: boolean
        }[];
        line: {
          x: number;
          y: number;
          withinViewport: boolean
        }[];
        start: {
          x: number;
          y: number;
          withinViewport: boolean
        };
        end: {
          x: number;
          y: number;
          withinViewport: boolean
        };
      };
      touch: {
        changed: boolean;
        direction: string | undefined;
        duration: {
          value: number;
          units: string;
        };
        previousLine: {
          x: number;
          y: number;
          withinViewport: boolean
        }[];
        line: {
          x: number;
          y: number;
          withinViewport: boolean
        }[];
        start: {
          x: number;
          y: number;
          withinViewport: boolean
        };
        end: {
          x: number;
          y: number;
          withinViewport: boolean
        };
      };
    };
  }
```

## Stuck & Need Help?

> If you are genuinely stuck and need help, please first consult both the documentation and discussions. Then, if your issue is still unresolved, open a discussion on GitHub.

## Trouble With Errors?

> Again, first consult the documentation and discussion board on GitHub. Then, if your error or issue is not already been reported on GitHub, please do so. If you end up reporting it, please give as many details as possible to help me to know how to replicate it. That way, I can get it taken care of as soon as possible.

## Known Issues

> This is where I will list errors that are known. The ones I am working on will be under a section named `Errors In Development`, while the other's that have been reported will be under `Error Backlog`. All I ask is for your patience as I am the only one currently working on this library and I only have so much time.

### `Errors In Development`

> Nothing Yet.

### `Error Backlog`

> Nothing Yet.

## APIs In Development

> `This is where I will list the APIs I am currently working on or have planned to be added into the library.`

### API Status & Information Table

<table>
  <tr>
    <th colspan="4" style="text-align: center;">
      APIs In Development
    </th>
  </tr>
  <tr>
    <th colspan="1" style="text-align: center;">Backlog</th>
    <th colspan="1" style="text-align: center;">Developing</th>
    <th colspan="1" style="text-align: center;">Testing</th>
    <th colspan="1" style="text-align: center;">Finished</th>
  </tr>
  <tr>
    <td colspan="1" style="text-align: center">Nothing Yet</td>
    <td colspan="1" style="text-align: center">Nothing Yet</td>
    <td colspan="1" style="text-align: center">Nothing Yet</td>
    <td colspan="1" style="text-align: center">Nothing Yet</td>
  </tr>
</table>

## 💝 Support NGine

> If you find NGine useful and want to help support its development, you can send a small donation via PayPal:

[![Donate](https://img.shields.io/badge/Paypal-Donate-FFD700?style=for-the-badge&logo=paypal&labelColor=00457C&color=FEFEFE)](https://www.paypal.me/ncluff003)

> Every contribution — large or small — helps me build more robust tools for developers.
