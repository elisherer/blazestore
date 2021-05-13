const express = require("express");

const registerAuth = require("./oauth2");
const app = express();

registerAuth(app);

// Api call for google authentication
app.get("/", (req, res) => {
  res.send({
    user: req.user
  });
});

app.listen(3030, () => console.log("app listening on port 3030!"));
