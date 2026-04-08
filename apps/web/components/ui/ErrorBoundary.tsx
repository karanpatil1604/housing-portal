"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="panel p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center">
            <AlertTriangle className="text-rose-400" size={20} />
          </div>
          <div>
            <p className="text-slate-200 font-medium mb-1">
              Something went wrong
            </p>
            <p className="text-sm text-slate-500 font-mono">
              {this.state.error?.message ?? "Unknown error"}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Inline error alert (non-boundary) ────────────────────────
export function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-rose-500/8 border border-rose-500/20">
      <AlertTriangle className="text-rose-400 shrink-0 mt-0.5" size={16} />
      <p className="text-sm text-rose-300 font-mono">{message}</p>
    </div>
  );
}