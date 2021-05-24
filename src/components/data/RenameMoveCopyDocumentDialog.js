import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  FormGroup,
  FormLabel,
  TextField,
  Typography
} from "@material-ui/core";
import DialogTitleWithActions from "../DialogTitleActions";

const RenameMoveCopyDocumentDialog = ({
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
  const [form, setForm] = useState(() => ({
    path,
    move: true,
    recursive: false
  }));

  let invalid = form.path.split("/").length % 2 > 0;

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
        title={`${form.move ? "Rename / Move" : "Copy"} document`}
      />
      <DialogContent>
        <FormGroup>
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
            error={invalid}
            helperText={invalid ? "Path must be of a document (multiple of 2)" : " "}
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
                checked={form.recursive}
                disabled
                onChange={e => setForm({ ...form, recursive: e.target.checked })}
              />
            }
            label="Include all nested data (recursive) (not implemented)"
          />
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disableElevation
          variant="contained"
          onClick={() => {
            onSaveAsync(/* from */ path, /* to */ form).then(val => {
              if (val === false) return; // default prevented
              onClose();
            });
          }}
          disabled={invalid}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RenameMoveCopyDocumentDialog;
