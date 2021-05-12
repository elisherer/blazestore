import { useLocation, useParams } from "react-router-dom";
import { Box, IconButton } from "@material-ui/core";
import DataPanel from "./DataPanel";
import FirestoreBreadcrumbs from "./FirestoreBreadcrumbs";
import { useEffect, useState } from "react";
import Lookup from "./Lookup";
import { Edit as EditIcon } from "@material-ui/icons";
import DataPanelLoader from "./DataPanelLoader";

const DataExplorer = () => {
  const params = useParams();
  const location = useLocation();
  const update_message = location.state?.update_message;
  const [lookupValue, setLookupValue] = useState();
  const openLookup = () => setLookupValue("/" + location.pathname.split("/").slice(4).join("/"));

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
      fetch(`/api/project/${params.project}/${panel1Path}`, { signal })
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
      fetch(`/api/project/${params.project}/${panel2Path}`, { signal })
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
      fetch(`/api/project/${params.project}/${panel3Path}`, { signal })
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
            <FirestoreBreadcrumbs />
            <IconButton className="edit" size="small" onClick={openLookup}>
              <EditIcon fontSize="small" />
            </IconButton>
            <Box onClick={openLookup} sx={{ flex: 1 }} />
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
          {panel1Path && !panel1 && <DataPanelLoader />}
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
          {panel2Path && ((panel1Path && !panel1) || !panel2) && <DataPanelLoader />}
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
            <DataPanelLoader />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DataExplorer;
