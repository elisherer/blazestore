// https://firebase.google.com/docs/firestore/quotas#collections_documents_and_fields
const enc = new TextEncoder();

export const validateName = id => {
  if (enc.encode(id).length > 1500) {
    return "Must be no longer than 1,500 bytes";
  }
  if (!/^[^/?]*$/.test(id)) {
    return "Can't contain a forward slash (/)";
  }
  if (id.startsWith(".")) {
    return "Can't start with a dot (.)";
  }
  if (/__.*__/.test(id)) {
    return "Can't start and end with double underscores (__)";
  }
  return false;
};

export const validateDocPath = path => {
  if (path[0] === "/" || path[path.length - 1] === "/")
    return "Path must not start or end with '/'";
  if (!/^[^?]*$/.test(path)) return "Path must not contain ?";
  const partsLength = path.split("/").length;
  if (partsLength % 2 > 0) return "Path must be of a document (multiple of 2)";
  if (partsLength > 100) return "Over the maximum depth of subcollections";
  return false;
};

export const validateCollectionPath = path => {
  if (path[0] === "/" || path[path.length - 1] === "/")
    return "Path must not start or end with '/'";
  if (!/^[^?]*$/.test(path)) return "Path must not contain ?";
  const partsLength = path.split("/").length;
  if (partsLength % 2 === 0) return "Path must be of a collection (not a multiple of 2)";
  if (partsLength > 100) return "Over the maximum depth of subcollections";
  return false;
};
