import { List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { Add as AddIcon } from "@material-ui/icons";

const onlyIconsList = { "& .MuiListItemIcon-root": { minWidth: "32px" } };

const DataPanelAddButton = ({ onClick, title, children }) => {
  return (
    <List dense disablePadding sx={onlyIconsList}>
      <ListItem
        button
        selected
        onClick={onClick}
        sx={{ "&.MuiButtonBase-root": { backgroundColor: "transparent" } }}
      >
        <ListItemIcon>
          <AddIcon fontSize="small" color="primary" />
        </ListItemIcon>
        <ListItemText
          primaryTypographyProps={{ color: "primary", variant: "subtitle2" }}
          primary={title}
        />
        {children}
      </ListItem>
    </List>
  );
};

export default DataPanelAddButton;
