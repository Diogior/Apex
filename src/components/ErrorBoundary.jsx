import { Component } from "react";

/**
 * Catches a crash in one part of the app so the rest keeps working, and gives
 * the user a way back instead of a blank screen. `resetKey` (for example the
 * current tab) clears the error when the user navigates away.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(`[Apex] ${this.props.label || "Screen"} crashed:`, error, info?.componentStack);
  }

  componentDidUpdate(prev) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" style={{ padding: "48px 24px", display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
        <p style={{ fontSize: 20, fontWeight: 600, color: "var(--text)" }}>
          {this.props.label ? `${this.props.label} couldn’t load` : "Something went wrong"}
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.5, color: "var(--muted)", maxWidth: "34ch" }}>
          Your data is safe. Try again, or reload the app if it keeps happening.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            style={{ minHeight: 44, padding: "0 20px", borderRadius: 999, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontSize: 16, fontWeight: 600 }}
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ minHeight: 44, padding: "0 20px", borderRadius: 999, border: 0, background: "var(--accent)", color: "#111", fontSize: 16, fontWeight: 600 }}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
