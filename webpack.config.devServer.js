const config = require("./server/config");
const api = require("./server/api");

const port = config.getNumber("SERVER_PORT", 8090);

module.exports = {
  devServer: {
    port,
    hot: true,
    host: "0.0.0.0",
    compress: true,
    historyApiFallback: true,
    before: app => {
      app.use("/api", api.dev(), api(config));
    }
  }
};
