const config = require("./config");
const express = require("express");
const history = require("connect-history-api-fallback");
const registerOAuth2 = require("./oauth2");
const api = require("./api");

const port = config.getNumber("SERVER_PORT", 3030);

const app = express();
app.use(express.json());
if (config.auth.oauth2) {
  registerOAuth2(app);
}
app.use("/api", api(config));
app.use(history());
app.use(express.static("public"));
app.listen(port, () => console.log(`listening at http://localhost:${port}`));
