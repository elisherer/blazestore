import { createContext, useContext } from "react";

const ProjectsContext = createContext();

export const useProjects = (): [Object, Function] => {
  return useContext(ProjectsContext);
};

export const ProjectsProvider = ({ children, projects }) => {
  return <ProjectsContext.Provider value={projects}>{children}</ProjectsContext.Provider>;
};
