import { Switch, Route, Redirect } from "react-router-dom";
import { Box, CircularProgress, Grid, styled } from "@material-ui/core";
import MaterialUIProvider from "./MaterialUIProvider";
import ColorModeProvider from "./ColorModeProvider";
import Header from "./components/Header";
import ProjectIndex from "./components/Pages/ProjectIndex";
import NotFound from "./NotFound";

import { PromptProvider } from "./components/PromptProvider/PromptProvider";
import { NotificationProvider } from "./components/NotificationProvider/NotificationProvider";
import { UserProvider } from "./components/UserProvider";
import { useEffect, useState } from "react";
import { LocalizationProvider } from "@material-ui/lab";
import AdapterDateFns from "@material-ui/lab/AdapterDateFns";

const MainContainer = styled("div")(({ theme }) => ({
  position: "relative",
  overflow: "auto",
  flex: 1,
  p: theme.spacing(3),
  display: "flex"
  //backgroundImage: "linear-gradient(180deg,rgba(96, 96, 96, 0.3) 0%, rgba(240, 240, 240, 0.2) 16%)"
}));

const App = () => {
  const [loading, setLoading] = useState(true);
  const [userContext, setUserContext] = useState([]);
  useEffect(() => {
    fetch("/api/init")
      .then(x => x.json())
      .then(data => {
        setUserContext(data.result);
        setLoading(false);
      });
  }, []);

  return (
    <ColorModeProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MaterialUIProvider>
          <PromptProvider>
            <NotificationProvider>
              <UserProvider user={userContext}>
                {loading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100vw",
                      height: "100vh"
                    }}
                  >
                    <CircularProgress size={96} />
                  </Box>
                ) : (
                  <Grid container direction="column" wrap="nowrap">
                    <Header />
                    <MainContainer>
                      <Switch>
                        <Route exact path="/">
                          <Redirect to={`/project/${userContext.projects[0]}/data`} />
                        </Route>
                        <Route path="/project/:project">
                          <ProjectIndex />
                        </Route>
                        <Route path="*">
                          <NotFound />
                        </Route>
                      </Switch>
                    </MainContainer>
                  </Grid>
                )}
              </UserProvider>
            </NotificationProvider>
          </PromptProvider>
        </MaterialUIProvider>
      </LocalizationProvider>
    </ColorModeProvider>
  );
};

export default App;
