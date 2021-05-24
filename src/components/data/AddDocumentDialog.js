import { useMemo, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent } from "@material-ui/core";
import DialogTitleWithActions from "../DialogTitleActions";
import EditDocumentForm from "./EditDocumentForm";
import { validateName } from "./utils";

const AddDocumentDialog = ({
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
  const [form, setForm] = useState({ documentId: "", fieldsString: "{\n  \n}" });

  const fields = useMemo(() => {
    try {
      return JSON.parse(form.fieldsString);
    } catch (e) {
      return e;
    }
  }, [form.fieldsString]);

  const invalidFieldsValue = typeof fields === "object" && fields instanceof Error;
  const invalidDocumentId = validateName(form.documentId);

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
      <DialogTitleWithActions id="form-dialog-title" onClose={onClose} title="Add document" />
      <DialogContent>
        <EditDocumentForm
          form={form}
          setForm={setForm}
          parentPath={parentPath}
          jsonInvalid={invalidFieldsValue && fields}
          documentIdInvalid={invalidDocumentId}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disableElevation
          variant="contained"
          onClick={() => onSaveAsync(`${parentPath}/${form.documentId}`, fields).then(onClose)}
          disabled={!form.documentId || invalidFieldsValue || invalidDocumentId}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddDocumentDialog;
