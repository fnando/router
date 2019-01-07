const webpack = require("webpack");
const libraryTarget = process.env.LIBRARY_TARGET;
const library = process.env.LIBRARY;
const target = process.env.TARGET;
const entry = `${__dirname}/${process.env.ENTRY}`;
const filename = process.env.FILENAME;

module.exports = {
  entry: entry,
  devtool: "source-map",
  target: target,
  mode: "production",

  output: {
    path: `${__dirname}/dist/`,
    filename: `${filename}.js`,
    library: library,
    libraryTarget: libraryTarget
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["babel-loader"],
        include: [`${__dirname}/src/`],
      }
    ]
  }
};
