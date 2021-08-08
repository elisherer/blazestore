import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField
} from "@material-ui/core";
import DialogTitleWithActions from "../DialogTitleActions";
import { usePrompt } from "./PromptProvider";
import { useState } from "react";
import { useNotification } from "../NotificationProvider/NotificationProvider";
import { LoadingButton } from "@material-ui/lab";

const Prompt = () => {
  const [setPrompt, prompt] = usePrompt();
  const [input, setInput] = useState("");
  const notify = useNotification();
  const [takingAction, setTakingAction] = useState(false);

  const handleAction = () => {
    const action = prompt.action;
    const actionTaken = prompt.name;
    if (action) {
      setTakingAction(true);
      action(actionTaken, input)
        .then(result => {
          setTakingAction(false);
          if (result) {
            setPrompt(null);
            setInput("");
          }
        })
        .catch(e => {
          notify.error(e);
          setTakingAction(false);
        });
    } else {
      setPrompt(null);
      setInput("");
    }
  };

  const handleAction2 = () => {
    const action = prompt.action;
    const actionTaken = prompt.name2;
    if (action) {
      action(actionTaken, input).then(result => {
        if (result) {
          setPrompt(null);
          setInput("");
        }
      });
    } else {
      setPrompt(null);
      setInput("");
    }
  };

  const closeDialog = () => {
    const onCloseAction = prompt.onCloseAction;
    setPrompt(null);
    setInput("");
    onCloseAction && onCloseAction();
  };

  const requiresInput = Boolean(prompt?.inputText);

  return (
    <Dialog
      open={!!prompt}
      maxWidth="md"
      onClose={closeDialog}
      aria-labelledby="prompt-dialog-title"
      aria-describedby="prompt-dialog-description"
    >
      <DialogTitleWithActions
        id="prompt-dialog-title"
        onClose={closeDialog}
        title={prompt?.title}
      />
      <DialogContent>
        <DialogContentText id="prompt-dialog-description" component="pre">
          {prompt?.wrapInPre ? <pre>{prompt.message}</pre> : prompt?.message}
        </DialogContentText>
        {requiresInput && (
          <DialogContentText component="pre">
            <TextField
              autoFocus
              fullWidth
              color="warning"
              value={input || ""}
              onChange={e => setInput(e.target.value)}
              label={prompt?.inputText}
              variant="standard"
              focused
              placeholder={prompt?.inputHint}
              InputLabelProps={{ shrink: true }}
            />
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} disabled={takingAction}>
          {prompt?.negativeText || "Cancel"}
        </Button>
        {prompt?.name2 && (
          <LoadingButton
            onClick={handleAction2}
            variant="contained"
            disabled={requiresInput && !input}
            color={prompt?.dangerous ? "secondary" : "primary"}
            loading={takingAction}
            autoFocus
          >
            {prompt.name2}
          </LoadingButton>
        )}
        {prompt?.name && (
          <LoadingButton
            onClick={handleAction}
            variant="contained"
            disabled={requiresInput && !input}
            color={prompt?.dangerous ? "secondary" : "primary"}
            loading={takingAction}
            autoFocus
          >
            {prompt.name}
          </LoadingButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default Prompt;
