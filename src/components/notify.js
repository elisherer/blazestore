/**
 * These gets overridden with the toast methods when application mounts
 */
const notify = {
  info: msg => alert(msg),
  success: msg => alert(msg),
  warn: msg => alert(msg),
  error: msg => alert(msg)
};

notify._init = toast => {
  notify.info = (msg, description) =>
    toast({
      title: msg,
      description,
      severity: "info",
      duration: 4000,
      isClosable: true
    });
  notify.success = (msg, description) =>
    toast({
      title: msg,
      description,
      severity: "success",
      duration: 2000,
      isClosable: true
    });
  notify.warn = (msg, description) =>
    toast({
      title: msg,
      description,
      severity: "warning",
      duration: 4000,
      isClosable: true
    });
  notify.error = (msg, description) => {
    if (msg instanceof Error) {
      description = msg.stack;
      msg = msg.message;
    }
    toast({
      title: msg,
      description,
      severity: "error",
      duration: null,
      isClosable: true
    });
  };
};
export default notify;
