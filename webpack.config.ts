import path from 'path';
import webpack from 'webpack';
import 'webpack-dev-server';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import dotenv from 'dotenv';
import TerserPlugin from 'terser-webpack-plugin';

////////////////////////////////////////////////////////////
// > There will be a need for a conditional flag for the source mapping between development and production.
// > There is also a need to set a common configuration between development and production.

// Load environment variables from .env file
dotenv.config({ path: './config.env' });

// Getting the environment variable for the build mode
const MODE = process.env.BUILD_MODE || 'development';

// Setting the mode based on the environment variable
const isProduction = MODE === 'production';

/////////////////////////////////////////////////////
// > Common Webpack Configuration
const Common = {
  mode: MODE as 'development' | 'production', // This is the mode that the build will be made for. - My default will be development.
  devtool: isProduction ? false : 'source-map',
  experiments: {
    outputModule: true, // Enables the experimental feature in Webpack of exporting ECMAScript features whenever possible.
  },
  infrastructureLogging: {
    level: 'verbose',
  },
  optimization: {
    minimize: isProduction, // This will enable the minimization of the code in production mode.
    minimizer: [
      new TerserPlugin({
        extractComments: false, // This will prevent the extraction of comments from the code.
        terserOptions: {
          format: {
            comments: false, // This will prevent the comments from being included in the output.
          },
        },
      }),
    ],
  },
  plugins: [new NodePolyfillPlugin()],
  resolve: {
    extensions: ['.ts', '.tsx', '.d.ts', '.js', '.jsx'],
  },
  watchOptions: {
    ignored: ['**/node_modules'],
  },
};

console.log(`NGine | Webpack Configuration | ${MODE}`);

//////////////////////////////////////////////////////
// > NGine | CommonJS | Webpack Configuration
const CommonJS: webpack.Configuration = {
  entry: {
    index: {
      import: './Source/index.ts',
      filename: '[name].cjs', // Tell webpack the output filename for the specific entry point. This is first extracted from output.filename.
    },
  },
  module: {
    rules: [
      {
        exclude: [path.resolve(__dirname, 'node_modules'), /\.cy\.test\.ts/, /\.jest\.test\.ts/, /TESTS/, /cypress/],
        test: /\.[jt]s?(x)?$/, // Matches ALL TypeScript & JavaScript, including declaration files.
        use: {
          loader: 'ts-loader', // This is the loader that will be used for the TypeScript files.
          options: {
            configFile: 'tsconfig.json', // This is the configuration file that will be used for the TypeScript files.
            logLevel: 'info', // This is the log level that will be used for the TypeScript files.
            transpileOnly: false, // This is whether or not this should ONLY transpile the TypeScript files.
          },
        },
      },
    ],
  },
  output: {
    clean: false, // Clean the output directory before emitting new files.
    compareBeforeEmit: true, // Tells webpack to check if the file to be emitted already exists AND has the same content before emitting the file.
    globalObject: 'this',
    ignoreBrowserWarnings: false, // Hide warnings from the browser console in production.
    library: {
      type: 'module', // The type of the library that will be exported. - My default will be module.
    },
    libraryTarget: 'commonjs', // The target of the library that will be exported. - My default will be commonjs.
    module: true,
    path: path.resolve(`${__dirname}`, 'Dist/'), // The output path of the library as an absolute path.
  },
  target: 'node',
};

//////////////////////////////////////////////////////
// > NGine | ES6 Module | Webpack Configuration
const ESM: webpack.Configuration = {
  entry: {
    index: {
      import: './Source/index.ts',
      filename: '[name].js', // Tell webpack the output filename for the specific entry point. This is first extracted from output.filename.
    },
  },
  module: {
    rules: [
      {
        exclude: [path.resolve(__dirname, 'node_modules'), /\.cy\.test\.ts/, /\.jest\.test\.ts/, /TESTS/, /cypress/],
        test: /\.[jt]s?(x)?$/, // Matches ALL TypeScript & JavaScript, including declaration files.
        use: {
          loader: 'ts-loader', // This is the loader that will be used for the TypeScript files.
          options: {
            configFile: 'tsconfig.esm.json', // This is the configuration file that will be used for the TypeScript files.
            logLevel: 'info', // This is the log level that will be used for the TypeScript files.
            transpileOnly: false, // This is whether or not this should ONLY transpile the TypeScript files.
          },
        },
      },
    ],
  },
  output: {
    clean: false, // Clean the output directory before emitting new files.
    compareBeforeEmit: true, // Tells webpack to check if the file to be emitted already exists AND has the same content before emitting the file.
    globalObject: 'this',
    ignoreBrowserWarnings: false, // Hide warnings from the browser console in production.
    library: {
      type: 'module', // The type of the library that will be exported. - My default will be module.
    },
    libraryTarget: 'module', // The target of the library that will be exported. - My default will be module.
    module: true,
    path: path.resolve(`${__dirname}`, 'Dist/'), // The output path of the library as an absolute path.
  },
  target: 'web',
};

///////////////////////////////////////////////////
// > Webpack Configuration Exports
export default [
  { ...Common, ...CommonJS },
  { ...Common, ...ESM },
];

// test: /^(?!\.d\.ts(x)?$).*\.[jt]s?(x)?$/, // Matches ALL TypeScript & JavaScript outside of declaration files.
