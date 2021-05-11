import { useMemo } from "react";
import {
  colors,
  createMuiTheme,
  CssBaseline,
  GlobalStyles,
  ThemeProvider
} from "@material-ui/core";
import { useColorMode } from "./ColorModeProvider";

const overrides = {
  "#root": {
    height: "100vh",
    display: "flex"
  },
  ".monaco-editor .margin-view-overlays .current-line, .monaco-editor .view-overlays .current-line": {
    backgroundColor: "#383838"
  }
};

const MaterialUIProvider = ({
  children,
  type,
  nested
}: {
  children: any,
  type?: string,
  nested?: boolean
}) => {
  let [colorMode] = useColorMode();

  if (type) {
    colorMode = type;
  }

  const theme = useMemo(() => {
    return createMuiTheme({
      palette: {
        mode: colorMode,
        primary: { main: colors.blue.A400 },
        secondary: { main: colors.red[700] },
        appbar: { main: "#051e34" }
      }
    });
  }, [colorMode]);

  return (
    <ThemeProvider theme={theme}>
      {!nested && <CssBaseline />}
      {!nested && <GlobalStyles styles={overrides} />}
      {children}
    </ThemeProvider>
  );
};

export default MaterialUIProvider;
