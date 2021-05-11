const result = require("dotenv").config();
if (result.error) {
  throw result.error;
}

const has = key =>
  Object.prototype.hasOwnProperty.call(process.env, key) && process.env[key] !== "";

const get = (key, defaultValue) => {
  if (!has(key)) return defaultValue;
  return process.env[key];
};

module.exports = {
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
