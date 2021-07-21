import CloseIcon from "@material-ui/icons/Close";
import { Box, DialogTitle, IconButton, styled, Tooltip, Typography } from "@material-ui/core";

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(2),
  paddingBottom: 0,
  display: "flex",
  alignItems: "center"
}));

const DialogTitleWithActions = ({ title, titleIcon, children, onClose, ...other }) => {
  return (
    <StyledDialogTitle {...other}>
      <Box display="flex" flex={1} alignItems="center">
        {titleIcon}
        <Box pl={1} component={Typography} variant="h6">
          {title}
        </Box>
      </Box>
      <Box ml={1} color="grey.500">
        {children}
        {onClose ? (
          <Tooltip title="Close">
            <IconButton size="medium" aria-label="close" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        ) : null}
      </Box>
    </StyledDialogTitle>
  );
};

export default DialogTitleWithActions;
