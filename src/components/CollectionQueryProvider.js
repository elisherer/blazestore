import { useMemo, useContext, useReducer } from "react";
import { createContext } from "react";

const CollectionQueryContext = createContext();

export const useCollectionQuery = () => {
  return useContext(CollectionQueryContext);
};

const initialState = {};

const reducer = (state, action) => {
  return {
    ...state,
    [action.name]: action.query
  };
};

const CollectionQueryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo(() => [state, (name, query) => dispatch({ name, query })], [
    state,
    dispatch
  ]);

  return (
    <CollectionQueryContext.Provider value={value}>{children}</CollectionQueryContext.Provider>
  );
};

export default CollectionQueryProvider;
