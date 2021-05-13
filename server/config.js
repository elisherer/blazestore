const fs = require("fs");
const path = require("path");
const result = require("dotenv").config({ path: path.join(__dirname, "credentials", ".env") });
if (result.error) {
  throw result.error;
}

const has = key =>
  Object.prototype.hasOwnProperty.call(process.env, key) && process.env[key] !== "";

const get = (key, defaultValue) => {
  if (!has(key)) return defaultValue;
  return process.env[key];
};

const config = {
  auth: {}, // to be filled
  has,
  get,
  getNumber: (key, defaultValue) =>
    parseInt(get(key, typeof defaultValue === "number" ? defaultValue.toString() : undefined)),
  getJSON: (key, defaultValue) => {
    try {
      const value = get(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (e) {
      if (e instanceof SyntaxError) {
        console.error(
          `Bad JSON at config key ${key} - ${e.message} (using default value ${JSON.stringify(
            defaultValue
          )})`
        );
        return defaultValue;
      } else {
        throw e;
      }
    }
  },
  getBoolean: (key, defaultValue) => {
    const val = get(
      key,
      typeof defaultValue === "boolean" ? defaultValue.toString() : ""
    ).toLowerCase();
    return val === "true" || val === "1";
  }
};

// read credentials dir
const files = fs.readdirSync(path.join(__dirname, "credentials"));
files
  .filter(a => a.endsWith(".json"))
  .forEach(credFilename => {
    const contents = fs.readFileSync(path.join(__dirname, "credentials", credFilename), "utf8");
    try {
      const cred = JSON.parse(contents);
      if (process.env.GCLOUD_AUTH_TYPE === "oauth2") {
        if (cred.web) {
          config.auth.oauth2 = cred.web;
          config.auth.project_id = cred.web.project_id;
        }
      } else if (process.env.GCLOUD_AUTH_TYPE === "service_account") {
        if (cred.type === "service_account") {
          config.auth.service_account = cred;
          config.auth.project_id = cred.project_id;
        }
      }
    } catch (e) {
      console.error(e);
    }
  });

module.exports = config;
