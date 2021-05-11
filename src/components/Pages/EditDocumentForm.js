import {
  DialogContentText,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  TextField,
  Typography,
  styled
} from "@material-ui/core";
import uuid from "../../helpers/uuid";
import { Casino as CasinoIcon } from "@material-ui/icons";
import MonacoEditor from "../MonacoEditor";

const ExplainListItemText = styled(ListItemText)(() => ({
  color: "#ad5c38",
  margin: 0
}));

const EditDocumentForm = ({
  parentPath,
  form,
  setForm,
  update,
  documentIdInvalid,
  jsonInvalid
}) => {
  return (
    <DialogContentText component="div" sx={{ mb: 1 }}>
      <TextField margin="dense" fullWidth label="Parent path" value={"/" + parentPath} disabled />
      {!update ? (
        <Grid container>
          <Grid item xs={6}>
            <TextField
              autoFocus
              fullWidth
              margin="dense"
              label="Document ID"
              variant="outlined"
              value={form.documentId}
              error={documentIdInvalid}
              readOnly={update}
              onChange={e => setForm({ ...form, documentId: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="generate"
                      title="Generate UUID"
                      onClick={() => setForm({ ...form, documentId: uuid() })}
                    >
                      <CasinoIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={6} sx={{ p: 1 }}>
            <Typography variant="caption">
              A collection must contain at least one document, Cloud Firestore&apos;s unit of
              storage. Documents store your data as fields. (must not include /)
            </Typography>
          </Grid>
        </Grid>
      ) : (
        <Typography>
          All changes below will be merged into the document (so you can remove unchanged fields)
        </Typography>
      )}
      <Typography variant="body2">
        You can {update ? "edit" : "add"} the fields right here:{" "}
        {jsonInvalid && <span style={{ color: "red" }}>{jsonInvalid.message}</span>}
      </Typography>
      <Grid container>
        <Grid item xs={9}>
          <MonacoEditor
            language="json"
            variant="modal"
            value={form.fieldsString}
            onChange={fieldsString => setForm({ ...form, fieldsString })}
            minWidth="300px"
            height="430px"
          />
        </Grid>
        <Grid item xs={3} sx={{ fontColor: "initial" }}>
          <List dense disablePadding>
            <ListSubheader style={{ background: "inherit", lineHeight: "2em" }}>
              Value mapping for insertion:
            </ListSubheader>
            <ListItem>
              <ExplainListItemText
                primary={`"$time:<seconds/ISO>"`}
                secondary="Timestamp.fromDate(...)"
              />
            </ListItem>
            <ListItem>
              <ExplainListItemText primary={`"$ref:/..." `} secondary={`firestore.doc("/...")`} />
            </ListItem>
            <ListItem>
              <ExplainListItemText
                primary={`"$serverTime()"`}
                secondary="FieldValue.serverTimestamp()"
              />
            </ListItem>
            <ListItem>
              <ExplainListItemText
                primary={`["$geo", <la>, <lo>]`}
                secondary="new GeoPoint(<la>,<lo>)"
              />
            </ListItem>
            <ListSubheader style={{ background: "inherit", lineHeight: "2em" }}>
              Value mapping for update:
            </ListSubheader>
            <ListItem>
              <ExplainListItemText primary={`"$inc:<n>"`} secondary="FieldValue.increment(<n>)" />
            </ListItem>
            <ListItem>
              <ExplainListItemText
                primary={`["$union", ...]`}
                secondary="FieldValue.arrayUnion(...)"
              />
            </ListItem>
            <ListItem>
              <ExplainListItemText
                primary={`["$remove", ...]`}
                secondary="FieldValue.arrayRemove(...)"
              />
            </ListItem>
            <ListItem>
              <ExplainListItemText primary={`"$delete"`} secondary="FieldValue.delete()" />
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </DialogContentText>
  );
};

export default EditDocumentForm;
