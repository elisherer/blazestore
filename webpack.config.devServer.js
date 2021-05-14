const config = require("./server/config");
const registerOAuth2 = require("./server/oauth2");
const api = require("./server/api");

const port = config.getNumber("SERVER_PORT", 3030);

module.exports = {
  devServer: {
    port,
    hot: true,
    host: "0.0.0.0",
    compress: true,
    historyApiFallback: {
      disableDotRule: true
    },
    before: app => {
      if (config.auth.oauth2) {
        registerOAuth2(app);
      }
      app.use("/api", api.dev(), api(config));
    }
  }
};
