import { Home as HomeIcon, NavigateNext as NavigateNextIcon } from "@material-ui/icons";
import Link from "@material-ui/core/Link";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import { useMemo } from "react";

const FirestoreBreadcrumbs = () => {
  const location = useLocation();
  const params = useParams();

  const pathParts = useMemo(() => location.pathname.split("/").filter(Boolean).slice(3), [
    location.pathname
  ]);

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      maxItems={5}
      itemsAfterCollapse={4}
      sx={{ "& li": { lineHeight: "1em" } }}
    >
      <Link
        component={RouterLink}
        sx={{ display: "flex", alignItems: "center" }}
        color="inherit"
        to={`/project/${params.project}/data`}
      >
        <HomeIcon sx={{ mr: 0.5 }} />
      </Link>
      {pathParts.map((part, i) => (
        <span key={i}>
          <Link
            component={RouterLink}
            to={`/project/${params.project}/data/${pathParts.slice(0, i + 1).join("/")}`}
            sx={{
              display: "inline-block",
              maxWidth: "120px",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden"
            }}
          >
            {part}
          </Link>
        </span>
      ))}
    </Breadcrumbs>
  );
};

export default FirestoreBreadcrumbs;
