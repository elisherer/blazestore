import { useMemo, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent } from "@material-ui/core";
import DialogTitleWithActions from "../DialogTitleActions";
import EditDocumentForm from "./EditDocumentForm";

const UpdateDocumentDialog = ({
  open,
  parentPath,
  onClose,
  initialFields,
  onSaveAsync
}: {
  open: boolean,
  parentPath: string,
  onClose: Function,
  initialFields: Object,
  onSaveAsync?: Function
}) => {
  const [form, setForm] = useState(() => ({
    fieldsString: JSON.stringify(initialFields, null, 2)
  }));

  const fields = useMemo(() => {
    try {
      return JSON.parse(form.fieldsString);
    } catch (e) {
      return e;
    }
  }, [form.fieldsString]);

  const invalidFieldsValue = typeof fields === "object" && fields instanceof Error;

  return (
    <Dialog
      maxWidth="md"
      fullWidth
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") onClose(); // allow close if not backdrop click
      }}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitleWithActions id="form-dialog-title" onClose={onClose} title="Update document" />
      <DialogContent>
        <EditDocumentForm
          update
          form={form}
          setForm={setForm}
          parentPath={parentPath}
          jsonInvalid={invalidFieldsValue && fields}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disableElevation
          variant="contained"
          onClick={() => onSaveAsync(parentPath, fields).then(onClose)}
          disabled={Boolean(invalidFieldsValue)}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateDocumentDialog;
