const config = require("./config");
const express = require("express");
const mapper = require("./mapper");
const { v1 } = require("@google-cloud/firestore");
const firebase_tools = require("firebase-tools");

let fsac;
// init firebase
const admin = require("firebase-admin");
if (config.auth.service_account) {
  // assume service_type
  admin.initializeApp(
    {
      databaseURL: config.get("FIRESTORE_DATABASE_URL"),
      credential: admin.credential.cert(config.auth.service_account)
    },
    config.auth.service_account.project_id
  );

  // https://googleapis.dev/nodejs/firestore/4.11.0/v1.FirestoreAdminClient.html
  fsac = new v1.FirestoreAdminClient({ credentials: config.auth.service_account });
  fsac.initialize().catch(e => console.error(e));
}

/**
 *
 * @param req
 * @returns {app.App}
 */
const getApp = req => {
  const projectId = req.params.project;
  // this doesn't work
  if (config.auth.oauth2) {
    // each user has its own connection
    const appName = projectId + "_" + req.user.profile.id;
    const adminApp = admin.apps.includes(appName) ? admin.app(appName) : undefined;
    if (!adminApp) {
      const credential = admin.credential.refreshToken({
        type: "authorized_user",
        client_id: config.auth.oauth2.client_id,
        client_secret: config.auth.oauth2.client_secret,
        refresh_token: req.user.refreshToken
      });
      credential.implicit = true;
      return admin.initializeApp(
        {
          databaseURL: config.get("FIRESTORE_DATABASE_URL"),
          credential
        },
        appName
      );
    }
  } else if (config.auth.service_account) {
    return admin.app(projectId);
  }
  throw new Error("Can't resolve google cloud authentication type");
};

const api = () => {
  const router = new express.Router();

  router.get("/health", async (req, res) => {
    try {
      res.send({
        result: "ok"
      });
    } catch (err) {
      console.error(err);
      res.status(500);
      res.send({ error: err.message });
    }
  });

  router.get("/init", async (req, res) => {
    try {
      res.send({
        result: {
          projects: [config.auth.project_id],
          user: !req.user
            ? undefined
            : {
                displayName: req.user.profile.displayName,
                photo:
                  req.user.profile.photos &&
                  req.user.profile.photos[0] &&
                  req.user.profile.photos[0].value
              }
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500);
      res.send({ error: err.message });
    }
  });

  router.get("/project/:project/data", async (req, res) => {
    try {
      const firestore = getApp(req).firestore();

      const collections = await firestore.listCollections();
      res.send({
        result: {
          type: "project",
          items: collections.map(c => ({ id: c.id, path: c.path }))
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500);
      res.send({ error: err.message });
    }
  });

  router.get("/project/:project/data/*", async (req, res) => {
    try {
      const firestore = admin.app(req.params.project).firestore();

      const urlParts = req.path.split("/").slice(4); // skip the first 4
      const isDocument = urlParts.length % 2 === 0;
      let items, fields;
      if (isDocument) {
        const docRef = await firestore.doc(urlParts.join("/"));
        const docCollRef = await docRef.listCollections();
        items = docCollRef.map ? docCollRef.map(c => ({ id: c.id, path: c.path })) : [];
        const snapshot = await docRef.get();
        fields = snapshot._fieldsProto;
      } else {
        // collection

        // check for query
        if (req.query.field) {
          let queryBuilder = firestore.collection(urlParts.join("/"));
          if (req.query.cond && req.query.cond !== "_") {
            let cond_val = req.query.cond_val;
            if (req.query.cond_val_type === "number") cond_val = Number(cond_val);
            else if (req.query.cond_val_type === "boolean") cond_val = cond_val === "true";
            else if (req.query.cond_val_type === "json-array") cond_val = JSON.parse(cond_val);
            queryBuilder = queryBuilder.where(req.query.field, req.query.cond, cond_val);
          }
          if (req.query.sort === "asc" || req.query.sort === "desc") {
            queryBuilder = queryBuilder.orderBy(req.query.field, req.query.sort);
          }
          const queryResult = await queryBuilder.get();
          items = queryResult.docs.map(x => ({
            id: x.id,
            path: x.ref.path,
            field: req.query.field,
            value: x._fieldsProto[req.query.field]
          }));
        } else {
          // otherwise
          const docsArray = await firestore.collection(urlParts.join("/")).listDocuments();
          items = docsArray.map(x => ({ id: x.id, path: x.path }));
        }
      }
      res.send({
        result: {
          type: isDocument ? "document" : "collection",
          fields,
          items
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500);
      res.send({ error: err.message });
    }
  });

  router.put("/project/:project/data/*", async (req, res) => {
    try {
      const firestore = getApp(req).firestore();

      const urlParts = req.path.split("/").slice(4); // skip the first 4
      const path = urlParts.join("/");
      const isDocument = urlParts.length % 2 === 0;
      if (isDocument) {
        const writeResult = await firestore.doc(path).create(mapper(urlParts, firestore, req.body));
        res.send({
          result: `Document ${path} successfully created (At ${writeResult.writeTime.toDate()})`
        });
      } else {
        // collection
        res.status(400);
        res.send({ error: "You can't create a collection (without a document)" });
      }
    } catch (err) {
      console.error(err);
      res.status(500);
      res.send({ error: err.message });
    }
  });

  router.delete("/project/:project/data/*", async (req, res) => {
    try {
      const firestore = getApp(req).firestore();

      const urlParts = req.path.split("/").slice(4); // skip the first 4
      const path = urlParts.join("/");
      const isDocument = urlParts.length % 2 === 0;
      if (isDocument) {
        const writeResult = await firestore.doc(path).delete();
        res.send({
          result: `Document ${path} successfully deleted. (At ${writeResult.writeTime.toDate()})`
        });
      } else {
        // collection
        const collectionName = path.split("/").pop();
        if (req.query.confirmation !== collectionName) {
          res.status(400);
          res.send({ error: "'confirmation' field value must equal the collection name" });
          return;
        }
        await firebase_tools.firestore.delete(path, {
          project: req.params.project,
          recursive: true,
          yes: true
        });
        res.send({
          result: `Collection ${path} successfully deleted. (At ${Date.now()})`
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500);
      res.send({ error: err.message });
    }
  });

  router.patch("/project/:project/data/*", async (req, res) => {
    try {
      const firestore = getApp(req).firestore();

      const urlParts = req.path.split("/").slice(4); // skip the first 4
      const path = urlParts.join("/");
      const isDocument = urlParts.length % 2 === 0;
      if (isDocument) {
        const doc = await firestore.doc(path).get();
        const writeResult = await firestore
          .doc(path)
          .update(mapper(urlParts, firestore, req.body, doc));
        res.send({
          result: `Document ${path} successfully updated. (At ${writeResult.writeTime.toDate()})`
        });
      } else {
        // collection
        res.status(400);
        res.send({ error: "You can't update a collection (only documents)" });
      }
    } catch (err) {
      console.error(err);
      res.status(500);
      res.send({ error: err.message });
    }
  });

  router.get("/project/:project/indexes", async (req, res) => {
    try {
      const indexes = await fsac.listIndexes({
        parent: fsac.collectionGroupPath(req.params.project, "(default)", "-")
      });

      res.send({
        result: {
          type: "indexes",
          items: indexes
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500);
      res.send({ error: err.message });
    }
  });

  router.get("/project/:project/fields", async (req, res) => {
    try {
      const fields = await fsac.listFields({
        parent: fsac.collectionGroupPath(req.params.project, "(default)", "-"),
        filter: "indexConfig.usesAncestorConfig:false"
      });

      res.send({
        result: {
          type: "fields",
          items: fields
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500);
      res.send({ error: err.message });
    }
  });

  router.get("/project/:project/rules/list", async (req, res) => {
    try {
      const securityRules = getApp(req).securityRules();

      const rulesetMetadataList = await securityRules.listRulesetMetadata();

      res.send({
        result: {
          type: "rulesetMetadataList",
          rulesetMetadataList
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500);
      res.send({ error: err.message });
    }
  });

  router.get("/project/:project/rules", async (req, res) => {
    try {
      const securityRules = getApp(req).securityRules();

      const ruleset = await securityRules.getFirestoreRuleset();

      securityRules.listRulesetMetadata();

      res.send({
        result: {
          type: "ruleset",
          ruleset
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500);
      res.send({ error: err.message });
    }
  });

  router.get("/project/:project/query/:type/:path", async (req, res) => {
    try {
      const firestore = getApp(req).firestore();

      let ref;
      if (req.params.type === "collection") {
        ref = firestore.collection(req.params.path);
      }
      if (req.params.type === "collectionGroup") {
        ref = firestore.collectionGroup(req.params.path);
      }
      if (req.query.where_sort) {
        const clause = JSON.parse(req.query.where_sort);
        if (
          !Array.isArray(clause) ||
          clause.length < 2 ||
          clause.length > 3 ||
          typeof clause[0] !== "string" ||
          typeof clause[1] !== "string"
        ) {
          throw new Error("where_sort must be an array of 2/3 (first 2 values of string)");
        }
        if (clause.length === 3) {
          ref = ref.where(clause[0], clause[1], clause[2]);
        } else {
          ref = ref.orderBy(clause[0], clause[1]);
        }
      }

      let items = await ref.limit(Math.min(parseInt(req.query.limit || "50"), 50)).get();
      items = items.docs.map(doc => ({ path: doc.ref.path }));
      res.send({
        result: {
          type: "query",
          items
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500);
      res.send({ error: err.message });
    }
  });

  router.post("/project/:project/data-bulk/delete", async (req, res) => {
    try {
      const firestore = getApp(req).firestore();

      // validate
      if (!Array.isArray(req.body)) {
        res.status(400);
        res.send({ error: "Body must be an array of paths" });
      }
      const total = req.body.length;
      if (total > 500) {
        res.status(400);
        res.send({ error: `Array must not contain more than 500 paths (${total})` });
      }
      if (
        req.body.some(path => {
          const urlParts = path.split("/");
          const isDocument = urlParts.length % 2 === 0;
          return !isDocument;
        })
      ) {
        res.status(400);
        res.send({ error: "Not all paths are document paths" });
      }
      const bulkWriter = firestore.bulkWriter();
      let errorCount = 0;
      bulkWriter.onWriteError(e => {
        console.error(`Error: (${errorCount}/${total}) ` + e.message);
        errorCount++;
      });
      for (const path of req.body) {
        bulkWriter.delete(firestore.doc(path));
      }
      await bulkWriter.flush();
      if (errorCount === total) {
        res.status(500);
        res.send({ error: "All delete operations failed" });
      } else {
        res.send({
          result: `Deleting ${total} documents ended with ${errorCount} errors`
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500);
      res.send({ error: err.message });
    }
  });

  return router;
};

api.dev = () => {
  return express.json();
};

module.exports = api;
