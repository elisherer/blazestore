const config = require("./config");
const cookieSession = require("cookie-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const SCOPE = [
  "profile",
  "https://www.googleapis.com/auth/datastore",
  "https://www.googleapis.com/auth/cloud-platform"
];

const _users = {};

const registerOAuth2 = app => {
  app.use(
    cookieSession({
      name: "session",
      secret: config.auth.oauth2.client_secret,
      maxAge: 24 * 60 * 60 * 1000 // session will expire after 24 hours
    })
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: config.auth.oauth2.client_id,
        clientSecret: config.auth.oauth2.client_secret,
        callbackURL: config.get("OAUTH2_REDIRECT_URL", config.auth.oauth2.redirect_uris[0])
      },
      (accessToken, refreshToken, profile, cb) => {
        if (!_users[profile.id]) {
          _users[profile.id] = { profile, accessToken, refreshToken };
        }
        cb(null, _users[profile.id]);
      }
    )
  );
  passport.serializeUser((user, cb) => {
    cb(null, user.profile.id);
  });
  passport.deserializeUser((id, cb) => {
    const user = _users[id];
    cb(null, user || false, user ? undefined : { error: "user session not found" });
  });

  app.use(passport.initialize());
  app.use(passport.session());

  const authorize = passport.authenticate("google", {
    scope: SCOPE,
    // offline access will give you both an access and refresh token so that
    // your app can refresh the access token without user interaction
    accessType: "offline",
    // Using "consent" ensures that your application always receives a refresh token.
    // If you are not using offline access, you can omit this.
    prompt: "consent"
  });

  app.use(async (req, res, next) => {
    const session = req.session;
    if (!req.user && session && session.passport && _users[session.passport.user]) {
      req.user = _users[session.passport.user];
    }
    if (
      !req.user &&
      // public paths
      !req.path.startsWith("/api/login") &&
      !req.path.startsWith("/api/logout") &&
      !req.path.startsWith("/api/health") &&
      // dot rule
      !req.path.includes(".")
    ) {
      return authorize(req, res, next);
    }
    return next();
  });

  // Api call back function
  app.get(
    "/api/login",
    passport.authenticate("google", {
      scope: SCOPE
    }),
    (req, res) => {
      // Successful authentication, redirect home.
      res.redirect("/");
    }
  );

  app.get("/api/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });
};

module.exports = registerOAuth2;
