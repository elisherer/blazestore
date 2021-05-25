// https://firebase.google.com/docs/firestore/quotas#collections_documents_and_fields
const enc = new TextEncoder();

export const validateName = id => {
  if (enc(id).length > 1500) {
    return "Must be no longer than 1,500 bytes";
  }
  if (!/^[^/?]*$/.test(id)) {
    return "Cannot contain a forward slash (/) or a question mark (?)";
  }
  if (id === "." || id === "..") {
    return "Cannot solely consist of a single period (.) or double periods (..)";
  }
  if (/__.*__/.test(id)) {
    return "Cannot match the regular expression __.*__";
  }
  return false;
};

export const validateDocPath = path => {
  if (!/^[^?]*$/.test(path)) return "Path must not contain ?";
  const partsLength = path.split("/").length;
  if (partsLength % 2 > 0) return "Path must be of a document (multiple of 2)";
  if (partsLength > 100) return "Over the maximum depth of subcollections";
  return false;
};
