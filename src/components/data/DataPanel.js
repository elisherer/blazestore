import useMenu from "../hooks/useMenu";
import {
  Alert,
  Badge,
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
import {
  Code as CodeIcon,
  CollectionsBookmark as CollectionsBookmarkIcon,
  ContentCopy as ContentCopyIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  NavigateNext as NavigateNextIcon
} from "@material-ui/icons";
import AddCollectionDialog from "./AddCollectionDialog";
import useToggle from "../hooks/useToggle";
import { useHistory, useParams } from "react-router-dom";
import DocumentFields from "./DocumentFields";
import AddDocumentDialog from "./AddDocumentDialog";
import { useNotification } from "../NotificationProvider/NotificationProvider";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePrompt } from "../PromptProvider/PromptProvider";
import AddFieldDialog from "./AddFieldDialog";
import copyToClipboard from "../../helpers/copyToClipboard";
import FirestoreIcon from "../FirestoreIcon";
import RenameMoveCopyDialog from "./RenameMoveCopyDialog";
import { FixedSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import ApiClient from "./apiClient";
import DataPanelAddButton from "./DataPanelAddButton";
import QueryPopover from "../QueryPopover";
import { useCollectionQuery } from "../CollectionQueryProvider";
import { protoPrint } from "./protoPrint";

const onlyIconsList = { "& .MuiListItemIcon-root": { minWidth: "32px" } };

const DataPanel = ({ type, path, selectedPath, project, items, fields }) => {
  const menu = useMenu(),
    params = useParams(),
    [setPrompt] = usePrompt(),
    windowListRef = useRef();
  const { push } = useHistory();
  const startCollectionToggle = useToggle(),
    addDocumentToggle = useToggle(),
    addFieldToggle = useToggle(),
    updateDocumentToggle = useToggle(),
    renameMoveCopyToggle = useToggle(),
    codeView = useToggle(),
    notify = useNotification(),
    docRef = useRef(),
    queryToggleRef = useRef();

  const [queryOpen, setQueryOpen] = useState(false);
  const [queries, setQuery] = useCollectionQuery();

  const handleDeleteItem = async () => {
    const pathParts = path.split("/");
    const isDoc = pathParts.length % 2 === 0;
    setPrompt({
      title: `Delete ${isDoc ? "document" : "collection"}`,
      message: (
        <div>
          <Alert severity="error">
            This will permanently delete all data at this location, including all nested data.
          </Alert>
          <Typography variant="caption">{isDoc ? "Document" : "Collection"} location</Typography>
          <Typography>{path}</Typography>
        </div>
      ),
      dangerous: true,
      name: "Start delete",
      inputText: isDoc ? undefined : "Confirm you want to delete this collection by typing its ID:",
      inputHint: pathParts[pathParts.length - 1],
      action: async (actionTaken, input) => {
        const result = await ApiClient.deletePathAsync(params.project, path, input, true);
        if (result.success) {
          const parentPath = path.split("/").slice(0, -1).join("/");
          push(`/project/${params.project}/data/${parentPath}`);
          notify.success(result.message);
          return true; // close dialog
        } else {
          notify.error(result.error);
        }
        return false;
      }
    });
    menu.handleClose();
  };

  const deleteField = useCallback(
    async field => {
      const result = await ApiClient.updateDocumentFieldsAsync(params.project, path, {
        [field]: "$delete"
      });
      if (result.success) {
        push(`/project/${params.project}/data/${path}`, { update_message: result.message });
        notify.success(result.message);
      } else {
        notify.error(result.error);
      }
    },
    [notify, params.project, path, push]
  );

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
        const result = await ApiClient.updateDocumentFieldsAsync(
          params.project,
          path,
          Object.keys(fields).reduce((a, c) => {
            a[c] = "$delete";
            return a;
          }, {})
        );
        if (result.success) {
          push(`/project/${params.project}/data/${path}`, { update_message: result.message });
          notify.success(result.message);
          return true; // close dialog
        } else {
          notify.error(result.error);
        }
        return false;
      }
    });
    menu.handleClose();
  };

  const handleCreatePathAsync = async (path, fields) => {
    const result = await ApiClient.createPathAsync(params.project, path, fields);
    if (result.success) {
      push(`/project/${params.project}/data/${path}`, { update_message: result.message });
      notify.success(result.message);
    } else {
      notify.error(result.error);
      return false;
    }
    return true;
  };

  const handleUpdateDocumentAsync = async (path, fields, dontPush) => {
    const result = await ApiClient.updateDocumentFieldsAsync(params.project, path, fields);
    if (result.success) {
      !dontPush &&
        push(`/project/${params.project}/data/${path}`, { update_message: result.message });
      notify.success(result.message);
    } else {
      notify.error(result.error);
      return false;
    }
    return true;
  };

  useEffect(() => {
    const el = document.querySelector(`[data-path="${selectedPath}"]`);
    if (el) {
      el.scrollIntoViewIfNeeded ? el.scrollIntoViewIfNeeded() : el.scrollIntoView();
    }
  }, [selectedPath]);

  const lastPart = path?.split("/").pop();

  const handleCopyName = () => {
    menu.handleClose();
    if (copyToClipboard(type === "project" ? project : lastPart)) {
      notify.success("Name was copied to clipboard");
    } else {
      notify.warn("Name was not copied to clipboard");
    }
  };

  const handleOpenCopyMoveDocument = () => {
    renameMoveCopyToggle.handleOpen();
    menu.handleClose();
  };
  const handleRenameMoveCopyAsync = async (from, to) => {
    let result = await ApiClient.copyPathAsync(params.project, path, to.path);
    //await ApiClient.createPathAsync(params.project, to.path, docRef.current);
    if (!result.success) {
      notify.error(result.error);
      return false; // don't close window
    }
    if (!to.move) {
      push(`/project/${params.project}/data/${to.path}`, { update_message: result.message });
      notify.success(result.message);
    } else {
      result = await ApiClient.deletePathAsync(
        params.project,
        from,
        from.split("/").pop(),
        to.recursive
      );
      if (!result.success) {
        notify.error(result.error);
        return false; // don't close window
      } else {
        push(`/project/${params.project}/data/${to.path}`, { update_message: result.message });
        //check if renamed
        const fromLastIndexOfSlash = from.lastIndexOf("/"),
          toLastIndexOfSlash = to.path.lastIndexOf("/");
        if (
          from.substr(0, fromLastIndexOfSlash) === to.path.substr(0, toLastIndexOfSlash) &&
          from.substr(fromLastIndexOfSlash) !== to.path.substr(toLastIndexOfSlash)
        ) {
          notify.success(
            `Path renamed successfully from ${from.substr(
              fromLastIndexOfSlash + 1
            )} to ${to.path.substr(toLastIndexOfSlash + 1)}`
          );
        } else {
          notify.success(`Path moved successfully from ${from} to ${to.path}`);
        }
      }
    }
    return true;
  };

  const renderItemRow = ({ index, style }) => {
    const item = items[index];
    return (
      <ListItem
        button
        key={item.id}
        onClick={() => push(`/project/${params.project}/data/${item.path}`)}
        sx={{
          backgroundColor: selectedPath === item.path ? "action.selected" : undefined
        }}
        style={style}
      >
        <ListItemText
          primary={item.value ? protoPrint(item.value) : item.id}
          primaryTypographyProps={{
            sx: {
              opacity:
                typeof item.value !== "undefined" || selectedPath === item.path
                  ? 1
                  : item.missing
                  ? 0.4
                  : 0.5,
              fontFamily: '"Roboto Mono", monospace',
              fontStyle: item.missing ? "italic" : undefined,
              fontWeight: item.value ? "bold" : undefined,
              paddingLeft: 4,
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflowY: "clip",
              lineHeight: 1
            }
          }}
          secondary={typeof item.value !== "undefined" ? item.id : undefined}
          secondaryTypographyProps={{
            sx: {
              paddingLeft: 4,
              lineHeight: 0.875,
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflowY: "clip"
            }
          }}
          data-path={item.path}
        />
        {selectedPath === item.path && (
          <div>
            <ListItemSecondaryAction sx={{ right: 0 }}>
              <NavigateNextIcon />
            </ListItemSecondaryAction>
          </div>
        )}
      </ListItem>
    );
  };

  return (
    <>
      <AddCollectionDialog
        key={"col:" + path + startCollectionToggle.open}
        parentPath={path}
        open={startCollectionToggle.open}
        onClose={startCollectionToggle.handleClose}
        onSaveAsync={handleCreatePathAsync}
      />
      <AddDocumentDialog
        key={"doc:" + path + addDocumentToggle.open}
        parentPath={path}
        open={addDocumentToggle.open}
        onClose={addDocumentToggle.handleClose}
        onSaveAsync={handleCreatePathAsync}
      />
      <AddFieldDialog
        key={"fld:" + path + addFieldToggle.open}
        parentPath={path}
        open={addFieldToggle.open}
        onClose={addFieldToggle.handleClose}
        onSaveAsync={handleUpdateDocumentAsync}
      />
      <RenameMoveCopyDialog
        key={"cmd:" + path + renameMoveCopyToggle.open}
        path={path}
        open={renameMoveCopyToggle.open}
        onClose={renameMoveCopyToggle.handleClose}
        onSaveAsync={handleRenameMoveCopyAsync}
      />
      <List dense disablePadding sx={onlyIconsList}>
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
            <ListItemSecondaryAction sx={{ right: 4 }}>
              <Tooltip title="Copy name" placement="bottom-end">
                <IconButton size="small" onClick={handleCopyName}>
                  <ContentCopyIcon fontSize="sm" />
                </IconButton>
              </Tooltip>
              {type === "collection" && (
                <Tooltip title="Query" placement="bottom-end">
                  <IconButton ref={queryToggleRef} size="small" onClick={() => setQueryOpen(true)}>
                    <Badge color="primary" variant="dot" invisible={!queries[path]}>
                      <FilterListIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Actions" placement="bottom-end">
                <IconButton size="small" onClick={menu.handleOpen}>
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          )}
        </ListItem>
        <QueryPopover
          name={lastPart}
          queryValue={queries[path]}
          open={queryOpen}
          onClose={() => setQueryOpen(false)}
          anchorEl={queryToggleRef.current}
          onClear={() => {
            setQuery(path, null);
            setQueryOpen(false);
          }}
          onApply={obj => {
            setQuery(path, obj);
            setQueryOpen(false);
          }}
        />
        <Menu {...menu.Props}>
          <MenuItem onClick={handleOpenCopyMoveDocument} divider>
            <ListItemText primary="Rename / Move / Copy" />
          </MenuItem>
          {type === "collection" && (
            <MenuItem onClick={handleDeleteItem}>
              <ListItemText primary="Delete collection" />
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
        {type === "collection" ? (
          <DataPanelAddButton onClick={addDocumentToggle.handleOpen} title="Add document" />
        ) : (
          <DataPanelAddButton onClick={startCollectionToggle.handleOpen} title="Start collection" />
        )}
      </List>
      <Box
        ref={windowListRef}
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          overflow: "auto",
          flex: items?.length ? "1 50%" : "0"
        }}
      >
        <AutoSizer>
          {({ width, height }) => (
            <FixedSizeList
              itemCount={items?.length ?? 0}
              itemSize={36}
              width={width}
              height={height - 20}
              style={{ overflowX: "hidden" }}
            >
              {renderItemRow}
            </FixedSizeList>
          )}
        </AutoSizer>
      </Box>
      {type === "document" && (
        <DataPanelAddButton onClick={addFieldToggle.handleOpen} title="Add field">
          <ListItemSecondaryAction sx={{ right: 0 }}>
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
        </DataPanelAddButton>
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
            fieldsJsonRef={docRef}
            view={codeView.open ? "code" : "tree"}
            updateDocumentToggle={updateDocumentToggle}
            onUpdateDocumentAsync={handleUpdateDocumentAsync}
            deleteField={deleteField}
          />
        </Box>
      )}
    </>
  );
};

export default DataPanel;
