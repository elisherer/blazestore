import { Link } from "react-router-dom";

export const tsToDate = (seconds, nanos) => {
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
export const protoPrint = (desc, ctx) => {
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
      return ctx && ctx.project ? (
        <span>
          <span>(reference)&nbsp;</span>
          <Link title="Follow reference" to={`/project/${ctx.project}/data${ref}`}>
            {ref}
          </Link>
        </span>
      ) : (
        ref
      );
    }
    case "geoPointValue": {
      const geoLabel = `[${val.latitude}° N, ${val.longitude}° E]`;
      return !ctx ? (
        geoLabel
      ) : (
        <a
          title="See on Google Maps"
          href={`https://maps.google.com/maps?q=${val.latitude},${val.longitude}&z=17&t=k`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {geoLabel}
        </a>
      );
    }
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
