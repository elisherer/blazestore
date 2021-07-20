import { Route, Switch } from "react-router-dom";
import DataExplorer from "./DataExplorer";
import CollectionQueryProvider from "../CollectionQueryProvider";

const DataIndex = () => {
  /*
  const [value, setValue] = useState(0);
  const params = useParams();
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };*/

  return (
    /*
      <Tabs value={value} onChange={handleChange} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tab component={Link} label="Data" to={`/project/${params.project}/data`} />
        <Tab component={Link} label="Rules" to={`/project/${params.project}/rules`} />
        <Tab component={Link} label="Indexes" to={`/project/${params.project}/indexes`} />
        <Tab component={Link} label="Usage" to={`/project/${params.project}/usage`} />
      </Tabs>*/
    <Switch>
      <Route path="/project/:project/data">
        <CollectionQueryProvider>
          <DataExplorer />
        </CollectionQueryProvider>
      </Route>
      <Route path="*">N/A</Route>
    </Switch>
  );
};

export default DataIndex;
