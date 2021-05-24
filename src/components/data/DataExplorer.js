import { useLocation, useParams } from "react-router-dom";
import { Box, IconButton, Tooltip } from "@material-ui/core";
import DataPanel from "./DataPanel";
import FirestoreBreadcrumbs from "./FirestoreBreadcrumbs";
import { useEffect, useState } from "react";
import copyToClipboard from "../../helpers/copyToClipboard";
import Lookup from "./Lookup";
import { ContentCopy as ContentCopyIcon } from "@material-ui/icons";
import OverlayLoader from "../OverlayLoader";
import { useNotification } from "../NotificationProvider/NotificationProvider";

const DataExplorer = () => {
  const params = useParams();
  const location = useLocation();
  const notify = useNotification();
  const update_message = location.state?.update_message;
  const [lookupValue, setLookupValue] = useState();

  const currentPath = "/" + location.pathname.split("/").slice(4).join("/");
  const copyPath = () => {
    if (copyToClipboard(currentPath)) {
      notify.success("Current path copied to clipboard");
    } else {
      notify.warn("Current path was not copied to clipboard");
    }
  };
  const openLookup = () => setLookupValue(currentPath);

  const [panel1, setPanel1] = useState(null);
  const [panel2, setPanel2] = useState(null);
  const [panel3, setPanel3] = useState(null);
  const [panel1Path, setPanel1Path] = useState(null);
  const [panel2Path, setPanel2Path] = useState(null);
  const [panel3Path, setPanel3Path] = useState(null);

  useEffect(() => {
    const parts = location.pathname.split("/").slice(4);
    if (parts.length === 0) {
      setPanel1Path("");
      setPanel2Path(null);
      setPanel3Path(null);
    } else if (parts.length === 1) {
      setPanel1Path("");
      setPanel2Path(parts.join("/"));
      setPanel3Path(null);
    } else if (parts.length === 2) {
      setPanel1Path("");
      setPanel2Path(parts.slice(0, parts.length - 1).join("/"));
      setPanel3Path(parts.join("/"));
    } else if (parts.length > 2) {
      setPanel1Path(parts.slice(0, parts.length - 2).join("/"));
      setPanel2Path(parts.slice(0, parts.length - 1).join("/"));
      setPanel3Path(parts.join("/"));
    }
  }, [location.pathname]);

  // panel1 effect
  useEffect(() => {
    if (typeof panel1Path === "string") {
      setPanel1(null);
      const controller = new AbortController();
      const { signal } = controller;
      fetch(`/api/project/${params.project}/data/${panel1Path}`, { signal })
        .then(x => x.json())
        .then(res => setPanel1(res.result))
        .catch(e => {
          if (e.name !== "AbortError") throw e;
        });
      return () => controller.abort();
    }
  }, [panel1Path, params.project, update_message]);

  // panel2 effect
  useEffect(() => {
    setPanel2(null);
    if (panel2Path) {
      const controller = new AbortController();
      const { signal } = controller;
      fetch(`/api/project/${params.project}/data/${panel2Path}`, { signal })
        .then(x => x.json())
        .then(res => setPanel2(res.result))
        .catch(e => {
          if (e.name !== "AbortError") throw e;
        });
      return () => controller.abort();
    }
  }, [panel2Path, params.project, update_message]);

  // panel3 effect
  useEffect(() => {
    setPanel3(null);
    if (panel3Path) {
      const controller = new AbortController();
      const { signal } = controller;
      fetch(`/api/project/${params.project}/data/${panel3Path}`, { signal })
        .then(x => x.json())
        .then(res => setPanel3(res.result))
        .catch(e => {
          if (e.name !== "AbortError") throw e;
        });
      return () => controller.abort();
    }
  }, [panel3Path, params.project, update_message]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          borderBottom: 1,
          borderColor: "divider",
          cursor: "pointer",
          "& .edit": { visibility: "hidden" },
          "&:hover .edit": { visibility: "visible" }
        }}
      >
        {lookupValue ? (
          <Lookup lookupValue={lookupValue} setLookupValue={setLookupValue} />
        ) : (
          <>
            <FirestoreBreadcrumbs onEdit={openLookup} />
            <Box onClick={openLookup} sx={{ flex: 1 }} />
            <Tooltip title="Copy path">
              <IconButton size="small" onClick={copyPath}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
      <Box sx={{ flex: 1, display: "flex", overflow: "auto" }}>
        <Box
          sx={{
            flex: 0.27,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            position: "relative"
          }}
        >
          {panel1 && (
            <DataPanel
              key={panel1Path}
              project={params.project}
              path={panel1Path}
              selectedPath={panel2Path}
              {...panel1}
            />
          )}
          {panel1Path && !panel1 && <OverlayLoader />}
        </Box>
        <Box
          sx={{
            flex: 0.27,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            borderRight: 1,
            borderLeft: 1,
            borderColor: "divider",
            position: "relative"
          }}
        >
          {panel2 && (
            <DataPanel key={panel2Path} path={panel2Path} selectedPath={panel3Path} {...panel2} />
          )}
          {panel2Path && ((panel1Path && !panel1) || !panel2) && <OverlayLoader />}
        </Box>
        <Box
          sx={{
            flex: 0.46,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            position: "relative"
          }}
        >
          {panel3 && <DataPanel key={panel3Path} path={panel3Path} selectedPath="" {...panel3} />}
          {panel3Path && ((panel1Path && !panel1) || (panel2Path && !panel2) || !panel3) && (
            <OverlayLoader />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DataExplorer;
