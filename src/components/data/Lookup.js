import { InputBase } from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";

const Lookup = ({ lookupValue, setLookupValue }) => {
  const params = useParams(),
    { push } = useHistory();
  return (
    <form
      style={{ width: "100%" }}
      onSubmit={e => {
        e.preventDefault();
        push(
          `/project/${params.project}/data/${
            lookupValue.startsWith("/") ? lookupValue.substr(1) : lookupValue
          }`
        );
      }}
    >
      <InputBase
        type="search"
        autoFocus
        value={lookupValue}
        fullWidth
        onChange={e => setLookupValue(e.target.value)}
        onBlur={() => setLookupValue("")}
        onFocus={e => e.target.setSelectionRange(0, e.target.value.length)}
      />
    </form>
  );
};

export default Lookup;
