const fs = require("fs");
const path = require("path");

const readAllFiles = () => {
  const files = fs.readdirSync(__dirname);
  return files
    .filter(a => a.endsWith(".json"))
    .reduce((a, c) => {
      const contents = fs.readFileSync(path.join(__dirname, c), "utf8");
      try {
        const obj = JSON.parse(contents);
        if (!a[obj.project_id]) a[obj.project_id] = {};
        a[obj.project_id][obj.type] = obj;
      } catch (e) {
        console.error(e);
      }
      return a;
    }, {});
};

const applications = readAllFiles();

exports.getApplication = projectId => {
  if (
    applications[projectId] &&
    applications[projectId].firestore &&
    applications[projectId].service_account
  ) {
    return applications[projectId];
  }
};

exports.getAllApplications = () => Object.keys(applications);
