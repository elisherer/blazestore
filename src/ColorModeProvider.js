import { useMemo, useContext, useState } from "react";
import { createContext } from "react";
import { useMediaQuery } from "@material-ui/core";

const ColorModeContext = createContext();

export const useColorMode = () => {
  return useContext(ColorModeContext);
};

const ColorModeProvider = ({ children }: { children: any }) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [internalColorType, setInternalColorType] = useState(
    localStorage.getItem("color-mode") || (prefersDarkMode ? "dark" : "light")
  );

  const contextValue = useMemo(
    () => [
      internalColorType,
      type => {
        const newType =
          (typeof type === "string" && type) || (internalColorType === "dark" ? "light" : "dark"); // if not specified then toggle
        localStorage.setItem("color-mode", newType);
        setInternalColorType(newType);
      }
    ],
    [internalColorType]
  );

  return <ColorModeContext.Provider value={contextValue}>{children}</ColorModeContext.Provider>;
};

export default ColorModeProvider;
