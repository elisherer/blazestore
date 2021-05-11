import { AppBar, Grid, NativeSelect, Switch, Toolbar, Typography } from "@material-ui/core";
import { DarkMode, LightMode } from "@material-ui/icons";
import { useColorMode } from "../ColorModeProvider";
import FirestoreIcon from "./FirestoreIcon";
import { useProjects } from "./ProjectsProvider";
import { useHistory, useParams } from "react-router-dom";

const Header = () => {
  const [colorMode, setColorMode] = useColorMode();
  const projects = useProjects();
  const params = useParams();
  const { push } = useHistory();
  return (
    <AppBar position="static" color="inherit">
      <Grid container justifyContent="space-between" alignItems="center">
        <Toolbar>
          <FirestoreIcon size={32} />
          <Typography variant="h4" sx={{ ml: 2 }}>
            Blazestore
          </Typography>
        </Toolbar>
        <Toolbar>
          <NativeSelect value={params.project} onChange={e => push(`/project/${e.target.value}`)}>
            {projects.map(proj => (
              <option key={proj}>{proj}</option>
            ))}
          </NativeSelect>
        </Toolbar>
        <Toolbar>
          <LightMode />
          <Switch color="primary" checked={colorMode === "dark"} onChange={setColorMode} />
          <DarkMode />
        </Toolbar>
      </Grid>
    </AppBar>
  );
};

export default Header;
