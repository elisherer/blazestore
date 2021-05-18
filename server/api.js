const config = require("./config");
const express = require("express");
const mapper = require("./mapper");
const { v1 } = require("@google-cloud/firestore");

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
        const docsArray = await firestore.collection(urlParts.join("/")).listDocuments();
        items = docsArray.map(x => ({ id: x.id, path: x.path }));
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
        res.status(400);
        res.send({ error: "You can't delete a collection (only documents)" });
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
        const writeResult = await firestore.doc(path).update(mapper(urlParts, firestore, req.body));
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

  return router;
};

api.dev = () => {
  return express.json();
};

module.exports = api;
