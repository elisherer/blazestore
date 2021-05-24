export const validateName = name => !/^[^/?]*$/.test(name) && "Name must not contain / or ?";

export const validateDocPath = path => {
  if (!/^[^?]*$/.test(path)) return "Path must not contain ?";
  if (path.split("/").length % 2 > 0) return "Path must be of a document (multiple of 2)";
  return false;
};
