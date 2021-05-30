import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useHistory, useParams, NavLink, Link } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  TextField
} from "@material-ui/core";
import OverlayLoader from "../OverlayLoader";
import GroupingTable from "../GroupingTable";

const queryTerms = ["field", "cond", "value", "limit", "sort"];

const cgColumns = [
  {
    id: "path",
    label: "Path",
    format: (path, _, __, params) => (
      <Link to={`/project/${params.project}/data/${path}`}>{path}</Link>
    )
  }
];

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
  const query = useMemo(() => {
    if (!location.search) return null;
    return extractFromQuery(location.search);
  }, [location.search]);
  const [results, setResults] = useState([]);
  const [collectionGroups, setCollectionGroups] = useState(null);
  const [form, setForm] = useState({
    path: params.path,
    field: "",
    cond: "",
    value: "",
    limit: 10,
    sort: "",
    ...query
  });

  useEffect(() => {
    setCollectionGroups(null);
    const controller = new AbortController();
    const { signal } = controller;
    fetch(`/api/project/${params.project}/indexes`, { signal })
      .then(x => x.json())
      .then(res =>
        setCollectionGroups(
          [
            ...new Set(
              res.result?.items[0]
                .filter(ix => ix.queryScope === "COLLECTION_GROUP")
                .map(ix => ix.name.split("/")[5])
            )
          ].sort()
        )
      )
      .catch(e => {
        if (e.name !== "AbortError") throw e;
      });
    return () => controller.abort();
  }, [params.project]);

  const handleSearch = useCallback(
    e => {
      e && e.preventDefault();
      setResults(null);
      const searchQuery = formToQuery(form);
      fetch(`/api/project/${params.project}/query/${params.type}/${form.path}?${searchQuery}`)
        .then(x => x.json())
        .then(res => {
          setResults(res.result.items);
        })
        .catch(e => {
          if (e.name !== "AbortError") throw e;
        });
      history.replace(
        `/project/${params.project}/query/${params.type}/${form.path}?${searchQuery}`
      );
      return false;
    },
    [form, history, params.project, params.type]
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
          {params.type === "collection" && (
            <Grid item>
              <TextField
                variant="outlined"
                label="Field"
                margin="dense"
                InputLabelProps={{
                  shrink: true
                }}
                value={form.field}
                onChange={e => setForm({ ...form, field: e.target.value })}
              />
            </Grid>
          )}
          {params.type === "collection" && (
            <Grid item xs={2}>
              <FormControl fullWidth>
                <InputLabel shrink id="condition-label">
                  Condition
                </InputLabel>
                <Select
                  variant="outlined"
                  label="Condition"
                  labelId="condition-label"
                  margin="dense"
                  fullWidth
                  value={form.cond}
                  onChange={e => setForm({ ...form, cond: e.target.value })}
                >
                  <MenuItem value="">No condition</MenuItem>
                  <MenuItem value="==">(==) equal to</MenuItem>
                  <MenuItem value="!=">(!=) not equal to</MenuItem>
                  <MenuItem value=">">(&gt;) greater than</MenuItem>
                  <MenuItem value=">=">(&gt;=) greater than or equal to</MenuItem>
                  <MenuItem value="<">(&lt;) less than</MenuItem>
                  <MenuItem value="<=">(&lt;=) less than or equal to</MenuItem>
                  <MenuItem value="in">(in) equal to any of the following</MenuItem>
                  <MenuItem value="not-in">(not-in) not equal to any of the following</MenuItem>
                  <MenuItem value="array-contains">(array-contains) an array containing</MenuItem>
                  <MenuItem value="array-contains-any">
                    (array-contains-any) an array containing any
                  </MenuItem>
                </Select>
              </FormControl>
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
          <Box sx={{ p: 3, display: "flex", flexDirection: "column-reverse", marginLeft: "auto" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={!results || params.type === "collection"}
            >
              Search
            </Button>
          </Box>
        </Grid>
      </Box>
      {!results ? <OverlayLoader /> : <GroupingTable columns={cgColumns} rows={results} />}
    </Box>
  );
};

export default QueryIndex;
