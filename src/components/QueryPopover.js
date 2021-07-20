import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Popover,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography
} from "@material-ui/core";
import { useEffect, useState } from "react";

function getConditionValue(conditionValue, conditionValueType) {
  if (conditionValueType === "string") return conditionValue ? conditionValue.toString() : "";
  if (conditionValueType === "number") return Number(conditionValue);
  return ["true", "1"].includes(conditionValue.toLowerCase());
}

const isConditionRequiresJSONArray = c => ["in", "not-in", "array-contains-any"].includes(c);

const QueryPopover = ({ name, queryValue, open, onClose, anchorEl, onClear, onApply }) => {
  const [field, setField] = useState(""),
    [condition, setCondition] = useState("_"),
    [conditionValueType, setConditionValueType] = useState("string"),
    [conditionValue, setConditionValue] = useState(""),
    [sort, setSort] = useState("");

  useEffect(() => {
    setField(queryValue?.field ?? "");
    setCondition(queryValue?.condition ?? "_");
    setConditionValueType(queryValue?.conditionValueType ?? "string");
    setConditionValue(queryValue?.conditionValue ?? "");
    setSort(queryValue?.sort ?? "");
  }, [queryValue]);

  let preview = `.collection("${name}")`;
  if (field && condition !== "_") {
    preview += `\n   .where("${field}", "${condition}", ${JSON.stringify(
      getConditionValue(conditionValue, conditionValueType)
    )})`;
  }
  if (field && sort) {
    preview += `\n   .orderBy("${field}", "${sort}")`;
  }

  const sortEnabled = [">", ">=", "<", "<=", "_"].includes(condition);

  useEffect(() => {
    if (!sortEnabled) {
      setSort("");
    }
  }, [sortEnabled]);

  const conditionRequiresArray = isConditionRequiresJSONArray(condition);

  let invalidConditionValue = false;
  if (conditionValueType === "boolean") {
    if (!["true", "false", "0", "1"].includes(conditionValue.toLowerCase())) {
      invalidConditionValue = true;
    }
  } else if (conditionValueType === "json-array") {
    try {
      const parsedValue = JSON.parse(conditionValue);
      if (
        !Array.isArray(parsedValue) ||
        parsedValue.length === 0 ||
        parsedValue.length > 10 ||
        parsedValue.some(v => !["string", "number", "boolean"].includes(typeof v))
      )
        invalidConditionValue = true;
    } catch (e) {
      invalidConditionValue = true;
    }
  }

  const invalidChoice = condition === "_" && !sort;

  return (
    <Popover
      open={open}
      onClose={onClose}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right"
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right"
      }}
    >
      <Card sx={{ maxWidth: "340px" }}>
        <Box
          sx={{
            bgcolor: "action.selected",
            p: 1,
            borderColor: "divider",
            borderBottomWidth: 1,
            borderBottomStyle: "solid"
          }}
        >
          <Typography>Query collection</Typography>
        </Box>
        <CardContent>
          <TextField
            variant="standard"
            type="search"
            fullWidth
            label="Filter by field"
            InputLabelProps={{ shrink: true }}
            helperText="Suggested fields:"
            value={field}
            onChange={e => setField(e.target.value)}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Chip variant="outlined" size="small" label="id" onClick={() => setField("id")} />
            <Chip variant="outlined" size="small" label="key" onClick={() => setField("key")} />
            <Chip variant="outlined" size="small" label="name" onClick={() => setField("name")} />
            <Chip variant="outlined" size="small" label="email" onClick={() => setField("email")} />
            <Chip
              variant="outlined"
              size="small"
              label="created_at"
              onClick={() => setField("created_at")}
            />
          </Box>
          <FormControl fullWidth sx={{ my: 1 }}>
            <InputLabel
              sx={{
                transform: "scale(0.75)",
                width: "133%",
                position: "static",
                whiteSpace: "normal"
              }}
              shrink
            >
              Only show documents where the specified field is...
            </InputLabel>
            <Select
              variant="outlined"
              margin="dense"
              fullWidth
              sx={{ "& div": { padding: "8px" } }}
              value={condition}
              onChange={e => {
                const newConditionRequiresArray = isConditionRequiresJSONArray(e.target.value);
                if (newConditionRequiresArray && !conditionRequiresArray) {
                  setConditionValueType("json-array");
                  setConditionValue('[""]');
                } else if (!newConditionRequiresArray && conditionRequiresArray) {
                  setConditionValueType("string");
                  setConditionValue("");
                }
                setCondition(e.target.value);
              }}
            >
              <MenuItem value="_">No condition</MenuItem>
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
          {condition !== "_" && (
            <Grid container>
              <Grid item xs={5}>
                <Select
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  sx={{ "& div": { padding: "8px" } }}
                  value={conditionValueType}
                  onChange={e => {
                    setConditionValueType(e.target.value);
                    if (e.target.value === "boolean") {
                      setConditionValue("true");
                    }
                  }}
                >
                  {conditionRequiresArray ? (
                    <MenuItem value="json-array">JSON Array</MenuItem>
                  ) : (
                    [
                      <MenuItem key="string" value="string">
                        String
                      </MenuItem>,
                      <MenuItem key="number" value="number">
                        Number
                      </MenuItem>,
                      <MenuItem key="boolean" value="boolean">
                        Boolean
                      </MenuItem>
                    ]
                  )}
                </Select>
              </Grid>
              <Grid item xs>
                {conditionValueType === "boolean" ? (
                  <Select
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    sx={{ "& div": { padding: "8px" } }}
                    value={conditionValue}
                    onChange={e => {
                      setConditionValue(e.target.value);
                    }}
                  >
                    <MenuItem value="true"> true </MenuItem>
                    <MenuItem value="false"> false </MenuItem>
                  </Select>
                ) : (
                  <TextField
                    variant="outlined"
                    type={conditionValueType === "number" ? "number" : "search"}
                    fullWidth
                    margin="none"
                    label={
                      "Value" +
                      (conditionValueType === "json-array" ? " (Enter up to 10 values)" : "")
                    }
                    InputLabelProps={{ shrink: true }}
                    error={invalidConditionValue}
                    value={conditionValue}
                    onChange={e => setConditionValue(e.target.value)}
                  />
                )}
              </Grid>
            </Grid>
          )}
          <FormControl component="fieldset">
            <InputLabel
              sx={{
                transform: "scale(0.75)",
                width: "133%",
                position: "static",
                whiteSpace: "normal"
              }}
              shrink
            >
              Sort results
            </InputLabel>
            <RadioGroup row value={sort} onChange={e => setSort(e.target.value)}>
              <FormControlLabel
                value="asc"
                control={<Radio color="primary" size="small" disabled={!sortEnabled} />}
                label="Ascending"
              />
              <FormControlLabel
                value="desc"
                control={<Radio color="primary" size="small" disabled={!sortEnabled} />}
                label="Descending"
              />
            </RadioGroup>
          </FormControl>
        </CardContent>
        <Box
          sx={{
            bgcolor: "action.selected",
            p: 1,
            borderColor: "divider",
            color: "grey.500",
            borderWidth: 1,
            borderBottomStyle: "solid",
            borderTopStyle: "solid",
            font: "0.75em monospace",
            whiteSpace: "pre-wrap"
          }}
        >
          {preview}
        </Box>
        <CardActions sx={{ justifyContent: "space-between" }}>
          <Button onClick={onClear}>Clear</Button>
          <CardActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() =>
                onApply({ field, condition, conditionValueType, conditionValue, sort })
              }
              disabled={invalidConditionValue || invalidChoice}
            >
              Apply
            </Button>
          </CardActions>
        </CardActions>
      </Card>
    </Popover>
  );
};

export default QueryPopover;
