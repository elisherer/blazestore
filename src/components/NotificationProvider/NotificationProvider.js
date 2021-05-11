import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Alert, Snackbar } from "@material-ui/core";
import ErrorBoundary from "../../ErrorBoundary";

const NotificationContext = createContext();

export const useNotification = (): [Object, Function] => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const notify = useMemo(() => {
    return {
      info: (msg, description) =>
        setToast({
          title: msg,
          description,
          severity: "info",
          duration: 4000,
          isClosable: true
        }),
      success: (msg, description) =>
        setToast({
          title: msg,
          description,
          severity: "success",
          duration: 2000,
          isClosable: true
        }),
      warn: (msg, description) =>
        setToast({
          title: msg,
          description,
          severity: "warning",
          duration: 4000,
          isClosable: true
        }),
      error: (msg, description) => {
        if (msg instanceof Error) {
          description = "See console for stack trace";
          msg = msg.message;
        }
        setToast({
          title: msg,
          description,
          severity: "error",
          duration: null,
          isClosable: true
        });
      }
    };
  }, []);
  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <NotificationContext.Provider value={notify}>
      <ErrorBoundary onError={notify.error}>{children}</ErrorBoundary>
      <Snackbar
        key={toast?.severity}
        open={!!toast}
        autoHideDuration={toast?.duration}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={closeToast}
      >
        {toast ? (
          <Alert
            elevation={6}
            variant="filled"
            onClose={toast.isClosable ? closeToast : undefined}
            severity={toast.severity}
          >
            <strong>{toast.title}</strong>
            {toast.description && (
              <div style={{ whiteSpace: "pre", maxHeight: "90vh", maxWidth: "90vw" }}>
                {toast.description}
              </div>
            )}
          </Alert>
        ) : (
          <span />
        )}
      </Snackbar>
    </NotificationContext.Provider>
  );
};
