import { PureComponent } from "react";

class ErrorBoundary extends PureComponent {
  props: {
    onError: Function,
    children: any
  };

  static getDerivedStateFromError() {}

  componentDidCatch(error, errorInfo) {
    this.props.onError("Unexpected error caught", error.message);
    console.error(error, errorInfo?.componentStack ?? "");
  }

  render() {
    return this.props.children;
  }
}

export default ErrorBoundary;
