import { withStyles } from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import { TabList, TabPanel } from "@material-ui/lab";

export const TabListSmall = withStyles(theme => ({
  root: {
    borderBottom: "1px solid " + (theme.palette.mode === "dark" ? grey[600] : grey[300]),
    minHeight: 36,
    "& button[role=tab]": {
      minWidth: 100,
      minHeight: 32
    }
  }
}))(TabList);

export const TabPanelWithoutPadding = withStyles({
  root: {
    padding: 0,
    display: "flex",
    flex: 1,
    overflow: "auto",
    "&:empty": {
      display: "none"
    }
  }
})(TabPanel);
