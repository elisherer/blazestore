const express = require("express");
const mapper = require("./mapper");

// init firebase
const { getApplication, getAllApplications } = require("../applications");
const admin = require("firebase-admin");
getAllApplications().forEach(projectId => {
  const app = getApplication(projectId);
  admin.initializeApp(
    {
      databaseURL: app.firestore.database_url,
      credential: admin.credential.cert(app.service_account)
    },
    projectId
  );
});

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

  router.get("/project", async (req, res) => {
    try {
      res.send({
        result: admin.apps.map(app => app.name)
      });
    } catch (err) {
      console.error(err);
      res.status(500);
      res.send({ error: err.message });
    }
  });

  router.get("/project/:project", async (req, res) => {
    try {
      const firestore = admin.app(req.params.project).firestore();

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

  router.get("/project/:project/*", async (req, res) => {
    try {
      const firestore = admin.app(req.params.project).firestore();

      const urlParts = req.path.split("/").slice(3); // skip the first 3
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

  router.put("/project/:project/*", async (req, res) => {
    try {
      const firestore = admin.app(req.params.project).firestore();

      const urlParts = req.path.split("/").slice(3); // skip the first 3
      const path = urlParts.join("/");
      const isDocument = urlParts.length % 2 === 0;
      if (isDocument) {
        const writeResult = await firestore.doc(path).create(mapper(path, firestore, req.body));
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

  router.delete("/project/:project/*", async (req, res) => {
    try {
      const firestore = admin.app(req.params.project).firestore();

      const urlParts = req.path.split("/").slice(3); // skip the first 3
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

  router.patch("/project/:project/*", async (req, res) => {
    try {
      const firestore = admin.app(req.params.project).firestore();

      const urlParts = req.path.split("/").slice(3); // skip the first 3
      const path = urlParts.join("/");
      const isDocument = urlParts.length % 2 === 0;
      if (isDocument) {
        const writeResult = await firestore.doc(path).update(mapper(path, firestore, req.body));
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

  return router;
};

api.dev = () => {
  return express.json();
};

module.exports = api;
