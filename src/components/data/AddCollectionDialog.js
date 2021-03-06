import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stepper,
  Step,
  StepButton,
  TextField,
  InputAdornment,
  IconButton
} from "@material-ui/core";
import { useMemo, useState } from "react";
import uuid from "../../helpers/uuid";
import { Casino as CasinoIcon } from "@material-ui/icons";
import EditDocumentForm from "./EditDocumentForm";
import { validateName } from "./utils";

const AddCollectionDialog = ({
  open,
  onClose,
  parentPath,
  onSaveAsync
}: {
  open: boolean,
  onClose: Function,
  parentPath: string,
  onSaveAsync: Function
}) => {
  const [form, setForm] = useState({ collectionId: "", documentId: "", fieldsString: "{\n  \n}" });
  const [step, setStep] = useState(0);

  const fields = useMemo(() => {
    try {
      return JSON.parse(form.fieldsString);
    } catch (e) {
      return e;
    }
  }, [form.fieldsString]);

  const invalidFieldsValue = typeof fields === "object" && fields instanceof Error;
  const invalidCollectionId = open && validateName(form.collectionId);
  const invalidDocumentId = open && validateName(form.documentId);

  return (
    <Dialog
      open={open}
      maxWidth="md"
      scroll="body"
      fullWidth
      onClose={onClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Start a collection</DialogTitle>
      <DialogContent>
        <Stepper activeStep={step} sx={{ pb: 4 }}>
          <Step completed={step > 0} onClick={() => setStep(0)}>
            <StepButton color="inherit">Give the collection an ID</StepButton>
          </Step>
          <Step>
            <StepButton color="inherit">Add its first document</StepButton>
          </Step>
        </Stepper>

        {step === 0 && (
          <DialogContentText component="div">
            <TextField
              margin="dense"
              fullWidth
              label="Parent path"
              value={"/" + parentPath}
              disabled
            />
            <TextField
              autoFocus
              margin="dense"
              sx={{ width: "50%" }}
              label="Collection ID"
              error={Boolean(invalidCollectionId)}
              helperText={
                invalidCollectionId ||
                "Choose an ID that describes the documents you???ll add to this collection."
              }
              variant="outlined"
              value={form.collectionId}
              onChange={e => {
                setForm({ ...form, collectionId: e.target.value });
              }}
              inputProps={{ pattern: "[^/]*" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="generate"
                      title="Generate UUID"
                      onClick={() => setForm({ ...form, collectionId: uuid() })}
                    >
                      <CasinoIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </DialogContentText>
        )}
        {step === 1 && (
          <EditDocumentForm
            form={form}
            setForm={setForm}
            parentPath={parentPath ? parentPath + "/" + form.collectionId : form.collectionId}
            jsonInvalid={invalidFieldsValue && fields}
            documentIdInvalid={invalidDocumentId}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {step > 0 && <Button onClick={() => setStep(step => step - 1)}>Back</Button>}
        {step < 1 && (
          <Button
            variant="contained"
            disableElevation
            onClick={() => setStep(step => step + 1)}
            disabled={Boolean(!form.collectionId || invalidCollectionId)}
          >
            Next
          </Button>
        )}
        {step === 1 && (
          <Button
            variant="contained"
            disableElevation
            onClick={() =>
              onSaveAsync(
                `${parentPath ? parentPath + "/" : "" /* project */}${form.collectionId}/${
                  form.documentId
                }`,
                fields
              ).then(onClose)
            }
            disabled={Boolean(
              !form.collectionId ||
                !form.documentId ||
                invalidFieldsValue ||
                invalidDocumentId ||
                invalidCollectionId
            )}
          >
            Save
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddCollectionDialog;
