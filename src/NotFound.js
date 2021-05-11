import { Box, Typography } from "@material-ui/core";
import { SentimentVeryDissatisfied as SentimentVeryDissatisfiedIcon } from "@material-ui/icons";

const NotFound = () => {
  return (
    <Box sx={{ overflow: "auto" }}>
      <Box sx={{ textAlign: "center", p: 4, fontSize: "10rem" }}>
        <SentimentVeryDissatisfiedIcon fontSize="inherit" />
        <Typography variant="h4">404 - Not Found</Typography>
      </Box>
    </Box>
  );
};

export default NotFound;
