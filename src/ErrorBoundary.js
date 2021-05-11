import { PureComponent } from "react";

class ErrorBoundary extends PureComponent {
  props: {
    onError: Function,
    children: any
  };

  static getDerivedStateFromError() {}

  componentDidCatch(error, errorInfo) {
    this.props.onError(error.message, errorInfo?.componentStack ?? "");
    console.error(error, errorInfo?.componentStack ?? "");
  }

  render() {
    return this.props.children;
  }
}

export default ErrorBoundary;
