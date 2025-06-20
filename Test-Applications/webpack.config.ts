import path from 'path';
import webpack from 'webpack';
import 'webpack-dev-server';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';

console.log(path.resolve(__dirname));
console.log(path.resolve('./'));
console.log('./');
console.log('./Frontend');

const Common: webpack.Configuration = {
  context: path.resolve(__dirname), // This is the context of the project. - My default will be the current directory.
  mode: 'development', // This is the mode that the build will be made for. - My default will be development.
  devtool: 'source-map', // This is where you set a tool that will be used for development. - My default will be source-map.
  experiments: {
    outputModule: true, // Enables the experimental feature in Webpack of exporting ECMAScript features whenever possible.
  },
  infrastructureLogging: {
    level: 'verbose',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.d.ts', '.js', '.jsx'],
  },
  watchOptions: {
    ignored: ['../node_modules'],
  },
};

/////////////////////////////////////////////
// > Webpack Configuration Creation
const createConfig = (appName: string): webpack.Configuration => {
  const miniCssPath = path.resolve(__dirname, appName, 'node_modules', 'mini-css-extract-plugin');
  const MiniCssExtractPlugin = require(miniCssPath);

  return {
    entry: {
      index: {
        import: `./${appName}/Frontend/TypeScript/index.ts`,
        filename: '[name].js',
      },
    },
    module: {
      rules: [
        {
          exclude: [path.resolve(__dirname, appName, 'node_modules')],
          test: /\.[jt]s?(x)?$/, // Matches ALL TypeScript & JavaScript, including declaration files.
          use: {
            loader: 'ts-loader', // This is the loader that will be used for the TypeScript files.
            options: {
              configFile: path.resolve(__dirname, `${appName}/tsconfig.test.json`), // This is the configuration file that will be used for the TypeScript files.
              transpileOnly: false, // This is whether or not this should ONLY transpile the TypeScript files.
            },
          },
        },
        {
          exclude: [path.resolve(__dirname, appName, 'node_modules')],
          include: [path.resolve(__dirname, appName, 'Frontend', 'CSS')],
          test: /\.css$/, // Matches ALL CSS files.
          use: [
            MiniCssExtractPlugin.loader, // This is the loader that will be used for the CSS files.
            'css-loader', // This is the loader that will be used for the CSS files.
          ],
        },
      ],
    },
    output: {
      clean: false, // Clean the output directory before emitting new files.
      compareBeforeEmit: true, // Tells webpack to check if the file to be emitted already exists AND has the same content before emitting the file.
      globalObject: 'this',
      ignoreBrowserWarnings: false, // Hide warnings from the browser console in production.
      module: true,
      path: path.resolve(`${__dirname}`, `${appName}`, 'Dist'), // The output path of the library as an absolute path.
    },
    plugins: [
      new NodePolyfillPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].css', // The name of the output file for the CSS.
        chunkFilename: '[id].css', // The name of the output file for the CSS chunks.
      }),
    ],
    resolveLoader: {
      modules: [path.resolve(__dirname, appName, 'node_modules'), 'node_modules'], // This is the path to the node_modules directory that will be used to resolve loaders.
    },
    target: 'web',
  };
};

const testApplications = ['Test-Contact-Form'];

export default [
  ...testApplications.map((appName) => {
    return { ...Common, ...createConfig(appName) };
  }),
];
