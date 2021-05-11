const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin"),
  CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin,
  BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin,
  CircularDependencyPlugin = require("circular-dependency-plugin"),
  CopyWebpackPlugin = require("copy-webpack-plugin"),
  ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin"),
  ESLintPlugin = require("eslint-webpack-plugin");
const mode = process.env.NODE_ENV || "development";
const node_modules = /[\\/]node_modules[\\/]/;
const PRODUCTION = mode === "production";
const ANALYZE = process.env.ANALYZE;

module.exports = {
  mode,
  target: PRODUCTION ? "browserslist" : "web",
  bail: PRODUCTION,
  entry: {
    main: "./src/index.js"
  },
  output: {
    filename: "[name]-[contenthash].js",
    path: path.join(__dirname, "dist"),
    publicPath: "/",
    chunkFilename: "[name]-[chunkhash].js",
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, "/")
  },
  devtool: ANALYZE ? "source-map" : PRODUCTION ? "source-map" : "cheap-module-source-map",
  devServer: require("./webpack.config.devServer").devServer,
  resolve: {
    modules: [path.resolve(__dirname, "src"), "node_modules"],
    symlinks: false
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(!PRODUCTION)
    }),

    new HtmlWebpackPlugin({
      chunks: ["main"],
      cache: PRODUCTION,
      template: "src/index.ejs"
    }),

    new ESLintPlugin({
      lintDirtyModulesOnly: !PRODUCTION,
      formatter: require("eslint-friendly-formatter"),
      failOnWarning: PRODUCTION,
      failOnError: PRODUCTION,
      emitWarning: !PRODUCTION
    }),

    !PRODUCTION && new ReactRefreshWebpackPlugin(), // hot module replacement for React

    PRODUCTION && new CleanWebpackPlugin(), // Cleanup before each build

    ANALYZE && new BundleAnalyzerPlugin({ analyzerMode: "static", openAnalyzer: false }),

    PRODUCTION &&
      new CircularDependencyPlugin({
        // only in production since it's slow
        exclude: /node_modules/
      }),

    new CopyWebpackPlugin({
      patterns: [
        { from: "public", to: "." },
        { from: "node_modules/monaco-editor/min/vs/", to: "vs" },
        !PRODUCTION && { from: "node_modules/monaco-editor/min-maps/vs/", to: "min-maps/vs" }
      ].filter(Boolean)
    })
  ].filter(Boolean),
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.(ico|gif|png|jpe?g|svg)$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10 * 1024, // 10KB
            name: "[path][name].[ext]",
            context: "src"
          }
        }
      },
      {
        test: /\.js$/,
        exclude: node_modules,
        resolve: {
          fullySpecified: false
        },
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: !PRODUCTION
          }
        }
      }
    ]
  }
};
