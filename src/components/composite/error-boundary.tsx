"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/composite/states";

type Props = {
  /** Name of the section, used in the fallback message. */
  section: string;
  children: ReactNode;
};

type State = { hasError: boolean };

/**
 * Contains a rendering failure to one section so the rest of the page keeps
 * working. Logs the error type only, never props or user data.
 */
export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error(`[${this.props.section}] render failed`, error, info.componentStack);
    } else {
      console.error(`[${this.props.section}] render failed: ${error.name}`);
    }
  }

  private reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title={`We could not show ${this.props.section}`}
          headingLevel="h3"
          actions={
            <Button variant="secondary" onClick={this.reset}>
              Try again
            </Button>
          }
        >
          The rest of the page is still available. If this keeps happening, please call reception.
        </ErrorState>
      );
    }
    return this.props.children;
  }
}
