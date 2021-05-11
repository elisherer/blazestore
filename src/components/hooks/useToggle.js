import { useState } from "react";

const useToggle = defaultOpen => {
  const [open, setOpen] = useState(Boolean(defaultOpen));

  const handleClose = () => {
      setOpen(false);
    },
    handleOpen = () => {
      setOpen(true);
    },
    handleToggle = () => {
      setOpen(prevOpen => !prevOpen);
    };

  return {
    open,
    handleClose,
    handleOpen,
    handleToggle
  };
};

export default useToggle;
