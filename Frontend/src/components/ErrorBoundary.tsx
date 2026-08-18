import { Component, type ReactNode } from 'react';
import { Message } from 'primereact/message';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Unhandled application error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <Message severity="error" text="Something went wrong. Please refresh the page." />
        </div>
      );
    }
    return this.props.children;
  }
}
