import { withStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import { Box, DialogTitle, IconButton, Tooltip, Typography } from "@material-ui/core";

const styles = theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
    paddingBottom: 0,
    display: "flex",
    alignItems: "center"
  },
  title: {
    flex: 1,
    display: "flex",
    alignItems: "center"
  },
  buttonGroup: {
    marginLeft: theme.spacing(1),
    color: theme.palette.grey[500]
  }
});

const DialogTitleWithActions = withStyles(styles)(props => {
  const { title, titleIcon, children, classes, onClose, ...other } = props;
  return (
    <DialogTitle disableTypography className={classes.root} {...other}>
      <div className={classes.title}>
        {titleIcon}
        <Box sx={{ pl: 1 }} component={Typography} variant="h6">
          {title}
        </Box>
      </div>
      <div className={classes.buttonGroup}>
        {children}
        {onClose ? (
          <Tooltip title="Close">
            <IconButton size="medium" aria-label="close" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        ) : null}
      </div>
    </DialogTitle>
  );
});

export default DialogTitleWithActions;
