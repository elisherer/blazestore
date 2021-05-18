const admin = require("firebase-admin");
const { FieldValue, GeoPoint, Timestamp } = admin.firestore;

const replacePath = (input, pathParts) =>
  input.replace(/\$path(\d+)?/g, (match, p1) => {
    return p1 ? pathParts[Number(p1)] : pathParts.join("/");
  });

const mapper = (pathParts, firestore, obj) => {
  if (Array.isArray(obj)) {
    if (obj[0] === "$union") {
      const [, ...args] = obj;
      return FieldValue.arrayUnion(...args);
    } else if (obj[0] === "$remove") {
      const [, ...args] = obj;
      return FieldValue.arrayRemove(...args);
    } else if (obj[0] === "$geo") {
      return new GeoPoint(Number(obj[1]), Number(obj[2]));
    }
    return obj.map(o => mapper(pathParts, firestore, o));
  }
  if (typeof obj === "string" || obj instanceof String) {
    if (obj === "$id") return pathParts[pathParts.length - 1];
    // last part
    else if (obj === "$delete") return FieldValue.delete();
    else if (obj.startsWith("$path")) return replacePath(obj, pathParts);
    else if (obj.startsWith("$ref:"))
      return firestore.doc(replacePath(obj.substring(5), pathParts));
    else if (obj === "$serverTime()") return FieldValue.serverTimestamp();
    else if (obj.startsWith("$inc:")) return FieldValue.increment(Number(obj.substring(5)));
    else if (obj.startsWith("$time:")) {
      const dateVal = obj.substring(6);
      return Timestamp.fromDate(
        /^\d+$/.test(dateVal) ? new Date(Number(dateVal)) : new Date(dateVal)
      );
    }
    return obj;
  } else if (typeof obj == "object") {
    // might be null
    if (obj) {
      Object.keys(obj).forEach(k => {
        obj[k] = mapper(pathParts, firestore, obj[k]);
      });
    }
    return obj;
  }
  return obj;
};

module.exports = mapper;
