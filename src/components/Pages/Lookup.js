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
        push(`/project/${params.project}/data${lookupValue}`);
      }}
    >
      <InputBase
        type="search"
        autoFocus
        value={lookupValue}
        fullWidth
        onChange={e => setLookupValue(e.target.value)}
        onBlur={() => setLookupValue("")}
      />
    </form>
  );
};

export default Lookup;
