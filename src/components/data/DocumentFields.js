import { TreeItem, TreeView } from "@material-ui/lab";
import { ArrowDropDown, ArrowRight } from "@material-ui/icons";
import { Box, Typography } from "@material-ui/core";
import { useMemo } from "react";
import MonacoEditor from "../../monaco/MonacoEditor";
import UpdateDocumentDialog from "./UpdateDocumentDialog";
import { Link, useParams } from "react-router-dom";

const tsToDate = (seconds, nanos) => {
  return seconds * 1000 + Math.round(nanos / 1e6);
};

/**
 *
 * @param desc
 * @param desc.valueType {string}
 * @param ctx
 * @param ctx.project {string}
 * @returns {string}
 */
const printValue = (desc, ctx) => {
  const val = desc[desc.valueType];
  switch (desc.valueType) {
    case "stringValue":
      return <span style={{ whiteSpace: "pre-wrap" }}>&quot;{val}&quot;</span>;
    case "timestampValue":
      return `${new Date(tsToDate(Number(val.seconds), val.nanos)).toGMTString()}`;
    case "booleanValue":
    case "integerValue":
    case "doubleValue":
      return `${val}`;
    case "referenceValue": {
      const ref = val.substr(val.indexOf("/documents/") + 10);
      return (
        <span>
          <span>(reference)&nbsp;</span>
          <Link title="Follow reference" to={`/project/${ctx.project}/data${ref}`}>
            {ref}
          </Link>
        </span>
      );
    }
    case "geoPointValue":
      return (
        <a
          title="See on Google Maps"
          href={`https://maps.google.com/maps?q=${val.latitude},${val.longitude}&z=17&t=k`}
          target="_blank"
          rel="noopener noreferrer"
        >
          [{val.latitude}° N, {val.longitude}° E]
        </a>
      );
    case "nullValue":
      return "null";
    case "arrayValue":
      return val.values?.length === 0 ? "[]" : "";
    case "mapValue":
      if (Object.keys(val.fields).length === 0) return "{}";
      return "";
  }
  return "N/A";
};

const MAX_SAFE_INTEGER_STRING = Number.MAX_SAFE_INTEGER.toString(),
  MAX_SAFE_INTEGER_LENGTH = MAX_SAFE_INTEGER_STRING.length;
const biggerThanInt32 = numString => {
  if (!/^\d+$/.test(numString)) return false; // not at integer
  if (numString.length > MAX_SAFE_INTEGER_LENGTH) return true;
  if (numString.length === MAX_SAFE_INTEGER_LENGTH && MAX_SAFE_INTEGER_STRING < numString)
    return true;
  return false;
};

const applyValue = (parent, node, desc, child) => {
  const val = desc[desc.valueType];
  switch (desc.valueType) {
    case "stringValue":
      return (parent[node] = val);
    case "timestampValue":
      return (parent[node] = `$time:${new Date(
        tsToDate(Number(val.seconds), val.nanos)
      ).toISOString()}`);
    case "booleanValue":
      return (parent[node] = Boolean(val));
    case "integerValue":
    case "doubleValue":
      return (parent[node] =
        typeof val === "number" ? val : biggerThanInt32(val) ? BigInt(val) : Number(val));
    case "referenceValue":
      return (parent[node] = `$ref:${val.substr(val.indexOf("/documents/") + 10)}`);
    case "geoPointValue":
      return (parent[node] = ["$geo", val.latitude, val.longitude]);
    case "nullValue":
      return (parent[node] = null);
    case "arrayValue":
      return (parent[node] = Object.values(child));
    case "mapValue":
      return (parent[node] = child);
  }
};

const renderTree = (ctx, path, nodes) => {
  let result = { json: {}, ids: [] };
  result.nodes = !nodes
    ? null
    : Object.keys(nodes)
        .sort()
        .map(node => {
          const composite = nodes[node].mapValue || nodes[node].arrayValue;
          let child;
          if (composite) {
            result.ids.push(path + node);
            child = nodes[node].mapValue
              ? renderTree(ctx, path + "/" + node, nodes[node].mapValue.fields)
              : nodes[node].arrayValue
              ? renderTree(ctx, path + "/" + node, nodes[node].arrayValue.values)
              : null;
            if (child.ids.length) {
              result.ids.push(...child.ids);
            }
          }
          applyValue(result.json, node, nodes[node], child?.json);
          return (
            <TreeItem
              key={node}
              nodeId={path + node}
              label={
                <Box sx={{ display: "flex", py: 1 }}>
                  <Typography
                    sx={{
                      opacity: 0.5,
                      fontSize: "0.9rem",
                      fontFamily: '"Roboto Mono", monospace',
                      mr: 1
                    }}
                  >
                    {node + (composite ? "" : ":")}
                  </Typography>
                  <Typography sx={{ fontSize: "0.9rem" }}>
                    {printValue(nodes[node], ctx)}
                  </Typography>
                </Box>
              }
            >
              {child?.nodes}
            </TreeItem>
          );
        });
  return result;
};

const DocumentFields = ({
  path,
  fields,
  fieldsJsonRef,
  view,
  updateDocumentToggle,
  onUpdateDocumentAsync
}) => {
  const params = useParams();
  const ctx = useMemo(() => ({ project: params.project }), [params.project]);
  const tree = useMemo(() => {
    const t = renderTree(ctx, "", fields);
    fieldsJsonRef.current = t.json;
    return t;
  }, [fieldsJsonRef, fields, ctx]);

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
          defaultExpanded={tree.ids}
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
