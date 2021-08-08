import { useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  FormGroup,
  TextField
} from "@material-ui/core";
import DialogTitleWithActions from "../DialogTitleActions";
import { validateCollectionPath, validateDocPath } from "./utils";
import { LoadingButton } from "@material-ui/lab";

const RenameMoveCopyDialog = ({
  open,
  path,
  onClose,
  onSaveAsync
}: {
  open: boolean,
  path: string,
  onClose: Function,
  onSaveAsync?: Function
}) => {
  const urlParts = path && path.split("/");
  const isDocument = urlParts && urlParts.length % 2 === 0;
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(() => ({
    path: path || "",
    move: true,
    recursive: true
  }));

  let invalidPath = isDocument ? validateDocPath(form.path) : validateCollectionPath(form.path);
  const targetSameAsSource = form.path === path;

  return (
    <Dialog
      maxWidth="xl"
      fullWidth
      open={open}
      onClose={onClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitleWithActions
        id="form-dialog-title"
        onClose={onClose}
        title={`${form.move ? "Rename / Move" : "Copy"} ${isDocument ? "document" : "collection"}`}
      />
      <DialogContent>
        <FormGroup sx={{ mt: 1 }}>
          <TextField
            label="From"
            fullWidth
            value={path}
            readOnly
            InputLabelProps={{
              shrink: true
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            autoFocus
            label="To"
            fullWidth
            value={form.path}
            onChange={e => setForm({ ...form, path: e.target.value })}
            onFocus={e => e.target.setSelectionRange(0, e.target.value.length)}
            InputLabelProps={{
              shrink: true
            }}
            error={Boolean(invalidPath)}
            helperText={invalidPath || " "}
          />
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={form.move}
                onChange={e => setForm({ ...form, move: e.target.checked })}
              />
            }
            label="Move item"
          />
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={!isDocument || form.recursive}
                disabled={!isDocument}
                onChange={e => setForm({ ...form, recursive: e.target.checked })}
              />
            }
            label="Include all nested data (recursive)"
          />
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <LoadingButton
          disableElevation
          variant="contained"
          onClick={() => {
            setSaving(true);
            onSaveAsync(/* from */ path, /* to */ form).then(val => {
              setSaving(false);
              if (val === false) return; // default prevented
              onClose();
            });
          }}
          loading={saving}
          disabled={Boolean(invalidPath) || targetSameAsSource}
        >
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default RenameMoveCopyDialog;
