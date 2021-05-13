import useMenu from "../hooks/useMenu";
import {
  Alert,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography
} from "@material-ui/core";
import FirestoreIcon from "../FirestoreIcon";
import {
  Add as AddIcon,
  Code as CodeIcon,
  CollectionsBookmark as CollectionsBookmarkIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  NavigateNext as NavigateNextIcon
} from "@material-ui/icons";
import AddCollectionDialog from "./AddCollectionDialog";
import useToggle from "../hooks/useToggle";
import { useHistory, useParams } from "react-router-dom";
import DocumentFields from "./DocumentFields";
import AddDocumentDialog from "./AddDocumentDialog";
import { useNotification } from "../NotificationProvider/NotificationProvider";
import { useEffect } from "react";
import { usePrompt } from "../PromptProvider/PromptProvider";
import AddFieldDialog from "./AddFieldDialog";

const DataPanel = ({ type, path, selectedPath, project, items, fields }) => {
  const menu = useMenu(),
    params = useParams(),
    [setPrompt] = usePrompt();
  const { push } = useHistory();
  const startCollectionToggle = useToggle(),
    addDocumentToggle = useToggle(),
    addFieldToggle = useToggle(),
    updateDocumentToggle = useToggle(),
    codeView = useToggle(),
    notify = useNotification();

  const handleDeleteItem = async () => {
    setPrompt({
      title: "Delete document",
      message: (
        <div>
          <Alert severity="error">
            This will permanently delete all data at this location, including all nested data.
          </Alert>
          <Typography variant="caption">Document location</Typography>
          <Typography>{path}</Typography>
        </div>
      ),
      dangerous: true,
      name: "Start delete",
      action: async () => {
        try {
          const res = await fetch(`/api/project/${params.project}/data/${path}`, {
            method: "DELETE"
          });
          const body = await res.json();
          if (res.status === 200) {
            notify.success(body.result);
            const parentPath = path.split("/").slice(0, -1).join("/");
            push(`/project/${params.project}/data/${parentPath}`);
          } else {
            notify.error(body.error);
          }
        } catch (e) {
          notify.error(e);
        }
      }
    });
    menu.handleClose();
  };

  const handleDeleteFieldsItem = async () => {
    setPrompt({
      title: "Delete data",
      message: (
        <div>
          <Alert severity="error">
            This will delete all fields of the document, excluding subcollections.
          </Alert>
          <Typography variant="caption">Document location</Typography>
          <Typography>{path}</Typography>
        </div>
      ),
      dangerous: true,
      name: "Delete",
      action: async () => {
        try {
          const res = await fetch(`/api/project/${params.project}/data/${path}`, {
            method: "PATCH",
            body: JSON.stringify(
              Object.keys(fields).reduce((a, c) => {
                a[c] = "$delete";
                return a;
              }, {})
            ),
            headers: { "content-type": "application/json" }
          });
          const body = await res.json();
          if (res.status === 200) {
            notify.success(body.result);
            push(`/project/${params.project}/data/${path}`, { update_message: body.result });
          } else {
            notify.error(body.error);
          }
        } catch (e) {
          notify.error(e);
        }
      }
    });
    menu.handleClose();
  };

  const handleAddDocumentAsync = async (path, fields) => {
    try {
      const res = await fetch(`/api/project/${params.project}/data/${path}`, {
        method: "PUT",
        body: JSON.stringify(fields),
        headers: { "content-type": "application/json" }
      });
      const body = await res.json();
      if (res.status === 200) {
        notify.success(body.result);
        push(`/project/${params.project}/data/${path}`, { update_message: body.result });
      } else {
        notify.error(body.error);
      }
    } catch (e) {
      notify.error(e);
    }
  };

  const handleUpdateDocumentAsync = async (path, fields) => {
    try {
      const res = await fetch(`/api/project/${params.project}/data/${path}`, {
        method: "PATCH",
        body: JSON.stringify(fields),
        headers: { "content-type": "application/json" }
      });
      const body = await res.json();
      if (res.status === 200) {
        notify.success(body.result);
        // full page refresh
        push(`/project/${params.project}/data/${path}`, { update_message: body.result });
      } else {
        notify.error(body.error);
      }
    } catch (e) {
      notify.error(e);
    }
  };

  useEffect(() => {
    const el = document.querySelector(`[data-path="${selectedPath}"]`);
    if (el) {
      el.scrollIntoView();
    }
  }, [selectedPath]);

  const lastPart = path?.split("/").pop();
  let addActionTitle, addActionHandler;
  switch (type) {
    case "project":
    case "document":
      addActionTitle = "Start collection";
      addActionHandler = startCollectionToggle.handleOpen;
      break;
    case "collection":
      addActionTitle = "Add document";
      addActionHandler = addDocumentToggle.handleOpen;
      break;
  }

  return (
    <>
      <AddCollectionDialog
        key={"col:" + path + startCollectionToggle.open}
        parentPath={path}
        open={startCollectionToggle.open}
        onClose={startCollectionToggle.handleClose}
        onSaveAsync={handleAddDocumentAsync}
      />
      <AddDocumentDialog
        key={"doc:" + path + addDocumentToggle.open}
        parentPath={path}
        open={addDocumentToggle.open}
        onClose={addDocumentToggle.handleClose}
        onSaveAsync={handleAddDocumentAsync}
      />
      <AddFieldDialog
        key={"fld:" + path + addFieldToggle.open}
        parentPath={path}
        open={addFieldToggle.open}
        onClose={addFieldToggle.handleClose}
        onSaveAsync={handleUpdateDocumentAsync}
      />
      <List dense disablePadding>
        <ListItem button divider onClick={() => push(`/project/${params.project}/data/${path}`)}>
          <ListItemIcon>
            {type === "project" ? (
              <FirestoreIcon />
            ) : type === "document" ? (
              <DescriptionIcon fontSize="small" />
            ) : (
              <CollectionsBookmarkIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText
            primary={type === "project" ? project : lastPart}
            sx={{ whiteSpace: "nowrap", overflow: "hidden" }}
          />
          {type !== "project" && (
            <ListItemSecondaryAction>
              <IconButton size="small" onClick={menu.handleOpen}>
                <MoreVertIcon />
              </IconButton>
            </ListItemSecondaryAction>
          )}
        </ListItem>
        <Menu {...menu.Props}>
          {type === "collection" && (
            <MenuItem disabled>
              <ListItemText primary="Delete collection (not implemented)" />
            </MenuItem>
          )}
          {type === "document" && (
            <MenuItem onClick={handleDeleteItem}>
              <ListItemText primary="Delete document" />
            </MenuItem>
          )}
          {type === "document" && (
            <MenuItem onClick={handleDeleteFieldsItem}>
              <ListItemText primary="Delete document fields" />
            </MenuItem>
          )}
        </Menu>
        <ListItem button selected onClick={addActionHandler}>
          <ListItemIcon>
            <AddIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{ color: "primary", variant: "subtitle2" }}
            primary={addActionTitle}
          />
        </ListItem>
      </List>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          overflow: "auto",
          flex: "1 30%"
        }}
      >
        <List dense disablePadding>
          {items?.map(item => (
            <ListItem
              button
              key={item.id}
              onClick={() => push(`/project/${params.project}/data/${item.path}`)}
              sx={{
                backgroundColor: selectedPath === item.path ? "action.selected" : undefined
              }}
            >
              <ListItemText
                inset
                primary={item.id}
                primaryTypographyProps={{
                  sx: {
                    opacity: selectedPath === item.path ? 1 : item.missing ? 0.4 : 0.5,
                    fontStyle: item.missing ? "italic" : undefined
                  }
                }}
                data-path={item.path}
              />
              {selectedPath === item.path && (
                <ListItemSecondaryAction>
                  <NavigateNextIcon />
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
        </List>
      </Box>
      {type === "document" && (
        <List dense disablePadding>
          <ListItem button selected onClick={addFieldToggle.handleOpen}>
            <ListItemIcon>
              <AddIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText
              primaryTypographyProps={{ color: "primary", variant: "subtitle2" }}
              primary="Add field"
            />
            <ListItemSecondaryAction>
              <Tooltip title="Toggle code/fields view">
                <IconButton size="small" onClick={codeView.handleToggle}>
                  <CodeIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Update document fields">
                <IconButton size="small" onClick={updateDocumentToggle.handleOpen}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      )}
      {type === "document" && (
        <Box
          sx={{
            flex: "1 100%",
            borderBottom: 1,
            borderColor: "divider",
            textAlign: "left",
            overflow: "auto"
          }}
        >
          <DocumentFields
            path={path}
            fields={fields}
            view={codeView.open ? "code" : "tree"}
            updateDocumentToggle={updateDocumentToggle}
            onUpdateDocumentAsync={handleUpdateDocumentAsync}
          />
        </Box>
      )}
    </>
  );
};

export default DataPanel;
