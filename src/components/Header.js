import {
  AppBar,
  Chip,
  Grid,
  Menu,
  MenuItem,
  Switch,
  Tab,
  Tabs,
  Toolbar,
  Typography
} from "@material-ui/core";
import { ArrowDropDown, DarkMode, LightMode } from "@material-ui/icons";
import MaterialUIProvider from "../MaterialUIProvider";
import { useColorMode } from "../ColorModeProvider";
import BlazestoreIcon from "./BlazestoreIcon";
import { useUserContext } from "./UserProvider";
import { NavLink, useHistory, useLocation } from "react-router-dom";
import useMenu from "./hooks/useMenu";

const Header = () => {
  const [colorMode, setColorMode] = useColorMode();
  const userContext = useUserContext();
  const location = useLocation();
  const { push } = useHistory();
  const projectDropDownMenu = useMenu();

  const project = location.pathname.split("/")[2]; // /project/{project}

  return (
    <MaterialUIProvider type="dark" nested>
      <AppBar position="static" sx={{ color: "white", backgroundColor: "#051e34" }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Toolbar>
            <BlazestoreIcon size={32} />
            <Typography variant="h4" sx={{ ml: 1 }}>
              Blazestore
            </Typography>
          </Toolbar>
          <Toolbar>
            <Chip
              label={project}
              onClick={projectDropDownMenu.handleOpen}
              onDelete={projectDropDownMenu.handleOpen}
              deleteIcon={<ArrowDropDown />}
              variant="outlined"
              sx={{ mr: 2 }}
            />
            <Tabs
              value={
                location.pathname.startsWith(`/project/${project}/data`)
                  ? 0
                  : location.pathname.startsWith(`/project/${project}/rules`)
                  ? 1
                  : location.pathname.startsWith(`/project/${project}/indexes`)
                  ? 2
                  : 3
              }
            >
              <Tab
                component={NavLink}
                to={`/project/${project}/data`}
                label="DATA"
                style={{ minWidth: "100px" }}
              />
              <Tab
                component={NavLink}
                to={`/project/${project}/rules`}
                label="RULES"
                style={{ minWidth: "100px" }}
              />
              <Tab
                component={NavLink}
                to={`/project/${project}/indexes`}
                label="INDEXES"
                style={{ minWidth: "100px" }}
              />
              <Tab
                component={NavLink}
                to={`/project/${project}/query/collectionGroup/`}
                label="QUERY"
                style={{ minWidth: "100px" }}
              />
            </Tabs>
            <Menu {...projectDropDownMenu.Props}>
              {userContext.projects.map(proj => (
                <MenuItem
                  key={proj}
                  onClick={() => {
                    push(`/project/${proj}/data`);
                    projectDropDownMenu.handleClose();
                  }}
                  selected={proj === project}
                >
                  {proj}
                </MenuItem>
              ))}
            </Menu>
          </Toolbar>
          <Toolbar>
            <LightMode />
            <Switch color="primary" checked={colorMode === "dark"} onChange={setColorMode} />
            <DarkMode />
          </Toolbar>
        </Grid>
      </AppBar>
    </MaterialUIProvider>
  );
};

export default Header;
