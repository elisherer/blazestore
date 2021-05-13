import { createContext, useContext } from "react";

const UserContext = createContext();

export const useUserContext = (): [Object, Function] => {
  return useContext(UserContext);
};

export const UserProvider = ({ children, user }) => {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};
