import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography
} from "@material-ui/core";
import DialogTitleWithActions from "../DialogTitleActions";
import { DateTimePicker } from "@material-ui/lab";

const defaultValueFor = type => {
  switch (type) {
    case "string":
      return "";
    case "number":
      return 0;
    case "boolean":
      return false;
    case "map":
      return {};
    case "reference":
      return "$ref:";
    case "timestamp":
      return "$time:" + Date.now();
    case "geopoint":
      return ["$geo", 0, 0];
    case "null":
      return null;
    case "array":
      return [];
  }
};

const AddFieldDialog = ({
  open,
  parentPath,
  onClose,
  onSaveAsync
}: {
  open: boolean,
  parentPath: string,
  onClose: Function,
  onSaveAsync?: Function
}) => {
  const [form, setForm] = useState(() => ({
    key: "",
    type: "string",
    value: ""
  }));

  let invalid = false;

  let inputControl;

  switch (form.type) {
    case "number":
    case "string":
    case "reference":
      inputControl = (
        <TextField
          label="Value"
          fullWidth
          value={form.type === "reference" ? form.value.substr(5) : form.value}
          type={form.type === "number" ? "number" : "text"}
          onChange={e =>
            setForm({
              ...form,
              value:
                form.type === "number"
                  ? Number(e.target.value)
                  : (form.type === "reference" ? "$ref:" : "") + e.target.value
            })
          }
          InputLabelProps={{
            shrink: true
          }}
        />
      );
      break;
    case "timestamp":
      inputControl = (
        <DateTimePicker
          onChange={dt => setForm({ ...form, value: `$time:${dt.getTime()}` })}
          value={new Date(Number(form.value.substr(6)))}
          renderInput={props => <TextField {...props} />}
        />
      );
      break;
    case "boolean":
      inputControl = (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <Typography>false</Typography>
          <Switch
            color="primary"
            value={form.value}
            onChange={e => setForm({ ...form, value: e.target.checked })}
          />
          <Typography>true</Typography>
        </Box>
      );
      break;
    case "geopoint":
      inputControl = (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <TextField
            label="Latitude"
            fullWidth
            value={form.value[1] || 0}
            type="number"
            onChange={e =>
              setForm({
                ...form,
                value: ["$geo", e.target.value, form.value[2] || 0]
              })
            }
            InputLabelProps={{
              shrink: true
            }}
          />
          <TextField
            label="Longitude"
            fullWidth
            value={form.value[2] || 0}
            type="number"
            onChange={e =>
              setForm({
                ...form,
                value: ["$geo", form.value[1] || 0, e.target.value]
              })
            }
            InputLabelProps={{
              shrink: true
            }}
          />
        </Box>
      );
      break;
  }

  return (
    <Dialog
      maxWidth="sm"
      fullWidth
      open={open}
      onClose={onClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitleWithActions id="form-dialog-title" onClose={onClose} title="Add field" />
      <DialogContent>
        <Box sx={{ display: "flex" }}>
          <Box sx={{ flexBasis: "30%" }}>
            <TextField
              autoFocus
              label="Field"
              fullWidth
              value={form.key}
              onChange={e => setForm({ ...form, key: e.target.value })}
              InputLabelProps={{
                shrink: true
              }}
            />
          </Box>
          <Typography fontSize={24}>=</Typography>
          <Select
            value={form.type}
            onChange={e =>
              setForm({ ...form, type: e.target.value, value: defaultValueFor(e.target.value) })
            }
          >
            <MenuItem value="string">string</MenuItem>
            <MenuItem value="number">number</MenuItem>
            <MenuItem value="boolean">boolean</MenuItem>
            <MenuItem value="map" disabled>
              map
            </MenuItem>
            <MenuItem value="array" disabled>
              array
            </MenuItem>
            <MenuItem value="null">null</MenuItem>
            <MenuItem value="timestamp">timestamp</MenuItem>
            <MenuItem value="geopoint">geopoint</MenuItem>
            <MenuItem value="reference">reference</MenuItem>
          </Select>
          {inputControl}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disableElevation
          variant="contained"
          onClick={() => {
            onSaveAsync(parentPath, {
              [form.key]: form.value
            }).then(onClose);
          }}
          disabled={Boolean(invalid)}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddFieldDialog;
