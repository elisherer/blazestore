import { Box, CircularProgress } from "@material-ui/core";

const OverlayLoader = () => {
  return (
    <Box
      sx={{
        position: "absolute",
        zIndex: 2,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.2)",
        transition: "background-color 200ms ease-in-out"
      }}
    >
      <CircularProgress size={64} />
    </Box>
  );
};

export default OverlayLoader;
