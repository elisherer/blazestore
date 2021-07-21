import { useMemo } from "react";
import { colors, CssBaseline, GlobalStyles, ThemeProvider } from "@material-ui/core";
import { createTheme } from "@material-ui/core/styles";
import { useColorMode } from "./ColorModeProvider";

const overrides = {
  "#root": {
    height: "100vh",
    display: "flex"
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
    return createTheme({
      palette: {
        mode: colorMode,
        primary: { main: colors.blue.A400 },
        secondary: { main: colors.red[700] }
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
