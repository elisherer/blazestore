import { Button, Dialog, DialogActions, DialogContent, DialogContentText } from "@material-ui/core";
import DialogTitleWithActions from "../DialogTitleActions";
import {usePrompt} from "./PromptProvider";

const Prompt = () => {
  const [setPrompt, prompt] = usePrompt();

  const handleAction = () => {
    const action = prompt.action;
    const actionTaken = prompt.name;
    setPrompt(null);
    action && action(actionTaken);
  };

  const handleAction2 = () => {
    const action = prompt.action;
    const actionTaken = prompt.name2;
    setPrompt(null);
    action && action(actionTaken);
  };

  const closeDialog = () => {
    const closeAction = prompt.closeAction;
    setPrompt(null);
    closeAction && closeAction();
  };

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
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog}>{prompt?.negativeText || "Cancel"}</Button>
        {prompt?.name2 && (
          <Button
            onClick={handleAction2}
            variant="contained"
            color={prompt?.dangerous ? "secondary" : "primary"}
            autoFocus
          >
            {prompt.name2}
          </Button>
        )}
        {prompt?.name && (
          <Button
            onClick={handleAction}
            variant="contained"
            color={prompt?.dangerous ? "secondary" : "primary"}
            autoFocus
          >
            {prompt.name}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default Prompt;
