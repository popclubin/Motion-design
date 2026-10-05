import { Component, type ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface Props {
  children: ReactNode;
  /** Changing this remounts the boundary's children and clears the error. */
  resetKey: string | number;
}

interface State {
  error: Error | null;
}

export class AnimationErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-[13px] text-muted">This animation crashed.</p>
          <Button variant="secondary" onClick={() => this.setState({ error: null })}>
            <RotateCcw size={14} />
            Reload animation
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
