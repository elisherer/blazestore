import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useHistory, useParams, NavLink, Link } from "react-router-dom";
import { Alert, Box, Button, Grid, Paper, Tab, Tabs, TextField } from "@material-ui/core";
import OverlayLoader from "../OverlayLoader";
import { DataGrid, GridToolbar } from "@material-ui/data-grid";
import ApiClient from "../data/apiClient";
import { usePrompt } from "../PromptProvider/PromptProvider";
import { useNotification } from "../NotificationProvider/NotificationProvider";
import { Delete } from "@material-ui/icons";

const queryTerms = ["limit", "where_sort"];

const extractFromQuery = query => {
  const sp = new URLSearchParams(query);
  return queryTerms.reduce((a, c) => {
    if (sp.has(c)) {
      a[c] = sp.get(c);
    }
    return a;
  }, {});
};

const formToQuery = form => {
  const sp = new URLSearchParams();
  queryTerms.forEach(c => form[c] && sp.append(c, form[c]));
  return sp;
};

const QueryIndex = () => {
  const location = useLocation();
  const history = useHistory();
  const params = useParams();
  const [setPrompt] = usePrompt();
  const notify = useNotification();
  const query = useMemo(() => {
    if (!location.search) return null;
    return extractFromQuery(location.search);
  }, [location.search]);
  const [results, setResults] = useState([]);
  const [collectionGroups, setCollectionGroups] = useState(null);
  const [form, setForm] = useState({
    path: params.path,
    where_sort: "",
    limit: 10,
    ...query
  });
  const [selectionModel, setSelectionModel] = useState(null);

  const handleDeleteSelected = async () => {
    setPrompt({
      title: `Delete ${selectionModel.length} documents`,
      message: (
        <div>
          <Alert severity="error">
            This will permanently delete those {selectionModel.length} documents, are you sure?
          </Alert>
        </div>
      ),
      dangerous: true,
      name: "Start delete",
      action: async () => {
        const result = await ApiClient.deletePathsAsync(params.project, selectionModel);
        if (result.success) {
          setResults(results.filter(item => !selectionModel.includes(item.id)));
          setSelectionModel(null);
          notify.success(result.message);
          return true; // close dialog
        } else {
          notify.error(result.error);
        }
        return false;
      }
    });
  };

  const collectionGroupColumns = useMemo(() => {
    return [
      {
        field: "id",
        headerName: "Path",
        flex: 0.6,
        renderCell: ({ value }) => (
          <Link to={`/project/${params.project}/data/${value}`}>{value}</Link>
        )
      }
    ];
  }, [params.project]);

  useEffect(() => {
    setCollectionGroups(null);
    const controller = new AbortController();
    const { signal } = controller;
    fetch(`/api/project/${params.project}/indexes`, { signal })
      .then(x => x.json())
      .then(res => {
        if (res.error) {
          notify.error(res.error);
        } else {
          setCollectionGroups(
            [
              ...new Set(
                res.result?.items[0]
                  .filter(ix => ix.queryScope === "COLLECTION_GROUP")
                  .map(ix => ix.name.split("/")[5])
              )
            ].sort()
          );
        }
      })
      .catch(e => {
        if (e.name !== "AbortError") notify.error(e);
      });
    return () => controller.abort();
  }, [params.project, notify]);

  const handleSearch = useCallback(
    e => {
      e && e.preventDefault();
      setResults(null);
      const searchQuery = formToQuery(form);
      fetch(`/api/project/${params.project}/query/${params.type}/${form.path}?${searchQuery}`)
        .then(x => x.json())
        .then(res => {
          if (res.error) {
            notify.error(res.error);
            setResults([]);
          } else {
            setResults(res.result.items.map(x => ({ id: x.path })));
          }
        })
        .catch(e => {
          if (e.name !== "AbortError") notify.error(e);
          setResults([]);
        });
      history.replace(
        `/project/${params.project}/query/${params.type}/${form.path}?${searchQuery}`
      );
      return false;
    },
    [form, history, params.project, params.type, notify]
  );

  // search on component mount from query if exists
  const [searchedFromQuery, setSearchedFromQuery] = useState(false);
  useEffect(() => {
    if ((params.path || query) && !searchedFromQuery) {
      handleSearch();
    }
    setSearchedFromQuery(true);
  }, [searchedFromQuery, params.path, query, handleSearch]);

  return (
    <Box sx={{ p: 3, flex: 1, overflow: "auto" }}>
      <Tabs
        value={
          location.pathname.startsWith(`/project/${params.project}/query/collectionGroup`) ? 0 : 1
        }
      >
        <Tab
          component={NavLink}
          to={`/project/${params.project}/query/collectionGroup`}
          label="Collection Group"
          style={{ minWidth: "100px" }}
        />
        <Tab
          component={NavLink}
          to={`/project/${params.project}/query/collection`}
          label="Collection"
          style={{ minWidth: "100px" }}
        />
      </Tabs>
      <Box sx={{ p: 3, mb: 2 }} component={Paper}>
        <Grid component="form" onSubmit={handleSearch} container spacing={3} data-lpignore="true">
          {params.type === "collectionGroup" && (
            <Grid item xs={2}>
              <TextField
                variant="outlined"
                type="search"
                label="Collection Group"
                margin="dense"
                fullWidth
                InputLabelProps={{
                  shrink: true
                }}
                value={form.path}
                onChange={e => setForm({ ...form, path: e.target.value })}
                inputProps={{ list: "collgroups" }}
              />
              <datalist id="collgroups">
                {collectionGroups?.map(cg => (
                  <option key={cg}>{cg}</option>
                ))}
              </datalist>
            </Grid>
          )}
          {params.type === "collection" && (
            <Grid item xs={4}>
              <TextField
                variant="outlined"
                label="Path"
                margin="dense"
                fullWidth
                InputLabelProps={{
                  shrink: true
                }}
                value={form.path}
                onChange={e => setForm({ ...form, path: e.target.value })}
              />
            </Grid>
          )}
          <Grid item>
            <TextField
              variant="outlined"
              label="Limit"
              type="number"
              margin="dense"
              style={{ width: "100px" }}
              inputProps={{ min: 1, max: 50 }}
              InputLabelProps={{
                shrink: true
              }}
              value={form.limit}
              onChange={e => setForm({ ...form, limit: e.target.value })}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              variant="outlined"
              label="Where / Sort (in JSON format, array of length 3 OR 2, or array of arrays)"
              placeholder={
                '[ "key", "==", 123 ] / [ "key", "asc" ] / [["key",">","2"],["key","asc"]]'
              }
              margin="dense"
              fullWidth
              InputLabelProps={{
                shrink: true
              }}
              value={form.where_sort}
              onChange={e => setForm({ ...form, where_sort: e.target.value })}
            />
          </Grid>
          <Box sx={{ p: 3, display: "flex", flexDirection: "column-reverse", marginLeft: "auto" }}>
            <Button type="submit" variant="contained" disabled={!results}>
              Search
            </Button>
          </Box>
        </Grid>
      </Box>
      {!results ? (
        <OverlayLoader />
      ) : (
        <DataGrid
          columns={collectionGroupColumns}
          rows={results}
          checkboxSelection
          //selectionModel={selectionModel}
          onSelectionModelChange={sm => setSelectionModel(sm)}
          components={{
            Toolbar: () => (
              <Box display="flex">
                <GridToolbar />
                {selectionModel && selectionModel.length > 0 && (
                  <Button onClick={handleDeleteSelected} startIcon={<Delete />} color="secondary">
                    Delete selected
                  </Button>
                )}
              </Box>
            )
          }}
        />
        //<GroupingTable columns={collectionGroupColumns} rows={results} />
      )}
    </Box>
  );
};

export default QueryIndex;
