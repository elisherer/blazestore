import { useEffect, useState } from "react";
import { Grid, Tab, Tabs, Typography } from "@material-ui/core";
import { useParams } from "react-router-dom";
import GroupingTable from "./GroupingTable";

const capitalize = word => word[0].toUpperCase() + word.substr(1);
const getDescriber = field => {
  switch (field.valueMode) {
    case "order":
      return capitalize(field.order.toLowerCase());
    case "arrayConfig":
      return "Arrays";
  }
};
const fieldsColumns = [
  { id: "name", label: "Collection ID", minWidth: 170, format: name => name.split("/")[5] },
  { id: "name", label: "Field path", minWidth: 170, format: name => name.split("/").pop() },
  {
    id: "indexConfig",
    label: "Collection scope",
    format: indexConfig =>
      indexConfig.indexes
        .filter(ix => ix.queryScope === "COLLECTION")
        .map(ix => getDescriber(ix.fields[0]))
        .join(",")
  },
  {
    id: "indexConfig",
    label: "Collection group scope",
    format: indexConfig =>
      indexConfig.indexes
        .filter(ix => ix.queryScope === "COLLECTION_GROUP")
        .map(ix => getDescriber(ix.fields[0]))
        .join(",")
  }
];

const indexesColumns = [
  { id: "name", label: "Collection ID", minWidth: 170, format: name => name.split("/")[5] },
  {
    id: "fields",
    label: "Fields indexed",
    maxWidth: 800,
    format: fields =>
      fields.map(f => (
        <span key={f.fieldPath}>
          <span>{f.fieldPath}</span>
          <Typography component="span" sx={{ color: "text.secondary", ml: 0.5, mr: 1 }}>
            {getDescriber(f)}
          </Typography>
        </span>
      ))
  },
  {
    id: "queryScope",
    label: "Query scope",
    minWidth: 170,
    format: queryScope => capitalize(queryScope.replace(/_/g, " ").toLowerCase())
  },
  {
    id: "state",
    label: "Status",
    format: state => (state === "READY" ? "Enabled" : state.toLowerCase())
  }
];

const IndexesIndex = () => {
  const params = useParams();
  const [view, setView] = useState("composite");
  const [indexes, setIndexes] = useState();
  const [fields, setFields] = useState();
  useEffect(() => {
    if (view === "composite") {
      setIndexes(null);
      const controller = new AbortController();
      const { signal } = controller;
      fetch(`/api/project/${params.project}/indexes`, { signal })
        .then(x => x.json())
        .then(res => setIndexes(res.result?.items[0]))
        .catch(e => {
          if (e.name !== "AbortError") throw e;
        });
      return () => controller.abort();
    } else if (view === "fields") {
      setFields(null);
      const controller = new AbortController();
      const { signal } = controller;
      fetch(`/api/project/${params.project}/fields`, { signal })
        .then(x => x.json())
        .then(res => setFields(res.result?.items[0]))
        .catch(e => {
          if (e.name !== "AbortError") throw e;
        });
      return () => controller.abort();
    }
  }, [params.project, view]);

  return (
    <Grid container direction="column" sx={{ margin: "24px auto", width: "90%" }}>
      <Grid item>
        <Tabs
          value={view === "composite" ? 0 : 1}
          onChange={(e, v) => setView(v === 1 ? "fields" : "composite")}
        >
          <Tab label="Composite" />
          <Tab label="Single field" />
        </Tabs>
      </Grid>
      <Grid item xs sx={{ overflow: "auto" }}>
        {view === "composite" && indexes?.slice && (
          <GroupingTable rows={indexes} columns={indexesColumns} />
        )}
        {view === "fields" && fields?.slice && (
          <GroupingTable rows={fields} columns={fieldsColumns} />
        )}
      </Grid>
    </Grid>
  );
};

export default IndexesIndex;
