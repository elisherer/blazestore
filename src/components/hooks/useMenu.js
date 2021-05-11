import { useState } from "react";

const useMenu = (horizontal = "left", vertical = "bottom") => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClose = () => setAnchorEl(null),
    handleOpen = event => setAnchorEl(event.currentTarget);

  return {
    Props: {
      variant: "menu",
      open: Boolean(anchorEl),
      anchorEl,
      anchorOrigin: {
        horizontal,
        vertical
      },
      keepMounted: true,
      onClose: handleClose
    },
    handleOpen,
    handleClose
  };
};

export default useMenu;
