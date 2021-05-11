import { createContext, useContext, useMemo, useState } from "react";
import Prompt from "./Prompt";

const PromptContext = createContext();

export const usePrompt = (): [Object, Function] => {
  return useContext(PromptContext);
};

export const PromptProvider = ({ children }) => {
  const [prompt, setPrompt] = useState(null);
  const state = useMemo(() => [setPrompt, prompt], [prompt]);

  return (
    <PromptContext.Provider value={state}>
      {children}
      <Prompt />
    </PromptContext.Provider>
  );
};
