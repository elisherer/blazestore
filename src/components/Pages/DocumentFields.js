import { TreeItem, TreeView } from "@material-ui/lab";
import { ArrowDropDown, ArrowRight } from "@material-ui/icons";
import { Box, Typography } from "@material-ui/core";
import { useMemo } from "react";
import MonacoEditor from "../MonacoEditor";
import UpdateDocumentDialog from "./UpdateDocumentDialog";

const tsToDate = (seconds, nanos) => {
  return seconds * 1000 + Math.round(nanos / 1e6);
};

/**
 *
 * @param desc
 * @param desc.valueType {string}
 * @returns {string}
 */
const printValue = desc => {
  switch (desc.valueType) {
    case "stringValue":
      return `"${desc[desc.valueType]}"`;
    case "timestampValue":
      return `${new Date(
        tsToDate(Number(desc[desc.valueType].seconds), desc[desc.valueType].nanos)
      ).toGMTString()}`;
    case "booleanValue":
    case "integerValue":
    case "referenceValue":
      return `${desc[desc.valueType]}`;
    case "geoPointValue":
      return `[${desc[desc.valueType].latitude}° N, ${desc[desc.valueType].longitude}° E]`;
    case "nullValue":
      return "null";
    case "arrayValue":
      return desc[desc.valueType].values?.length === 0 ? "[]" : "";
    case "mapValue":
      if (Object.keys(desc[desc.valueType].fields).length === 0) return "{}";
      return "";
  }
  return "N/A";
};

const applyValue = (parent, node, desc, child) => {
  switch (desc.valueType) {
    case "stringValue":
      return (parent[node] = desc[desc.valueType]);
    case "timestampValue":
      return (parent[node] = `$time:${new Date(
        tsToDate(Number(desc[desc.valueType].seconds), desc[desc.valueType].nanos)
      ).toISOString()}`);
    case "booleanValue":
      return (parent[node] = Boolean(desc[desc.valueType]));
    case "integerValue":
      return (parent[node] = Number(desc[desc.valueType]));
    case "referenceValue":
      return (parent[node] = `$ref:${desc[desc.valueType].substr(
        desc[desc.valueType].indexOf("/documents/") + 10
      )}`);
    case "geoPointValue":
      return (parent[node] = [
        "$geo",
        desc[desc.valueType].latitude,
        desc[desc.valueType].longitude
      ]);
    case "nullValue":
      return (parent[node] = null);
    case "arrayValue":
      return (parent[node] = Object.values(child));
    case "mapValue":
      return (parent[node] = child);
  }
};

const renderTree = (path, nodes) => {
  let result = { json: {} };
  result.nodes = !nodes
    ? null
    : Object.keys(nodes)
        .sort()
        .map(node => {
          const composite = nodes[node].mapValue || nodes[node].arrayValue;
          let child;
          if (composite) {
            child = nodes[node].mapValue
              ? renderTree(path + "/" + node, nodes[node].mapValue.fields)
              : nodes[node].arrayValue
              ? renderTree(path + "/" + node, nodes[node].arrayValue.values)
              : null;
          }
          applyValue(result.json, node, nodes[node], child?.json);
          return (
            <TreeItem
              key={node}
              nodeId={path + node}
              label={
                <Box sx={{ display: "flex" }}>
                  <Typography
                    sx={{ opacity: 0.5, fontSize: "0.9rem", fontFamily: "monospace", mr: 2 }}
                  >
                    {node + (composite ? "" : ":")}
                  </Typography>
                  <Typography sx={{ fontSize: "0.9rem" }}>{printValue(nodes[node])}</Typography>
                </Box>
              }
            >
              {child?.nodes}
            </TreeItem>
          );
        });
  return result;
};

const DocumentFields = ({ path, fields, view, updateDocumentToggle, onUpdateDocumentAsync }) => {
  const tree = useMemo(() => renderTree("", fields), [fields]);

  return (
    <>
      <UpdateDocumentDialog
        key={tree}
        open={updateDocumentToggle.open}
        parentPath={path}
        onClose={updateDocumentToggle.handleClose}
        initialFields={tree?.json}
        onSaveAsync={onUpdateDocumentAsync}
      />
      {view === "tree" ? (
        <TreeView
          aria-label="rich object"
          defaultCollapseIcon={<ArrowDropDown />}
          defaultExpanded={["root"]}
          defaultExpandIcon={<ArrowRight />}
        >
          {tree.nodes}
        </TreeView>
      ) : (
        <MonacoEditor
          variant="embedded"
          language="json"
          value={JSON.stringify(tree.json, null, 2)}
          readOnly
        />
      )}
    </>
  );
};

export default DocumentFields;
