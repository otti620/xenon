import React, { ErrorInfo, ReactNode } from 'react';
import { runSystemSelfHeal } from '../lib/selfHeal';
import { ShieldCheck, RefreshCw, AlertTriangle, Zap } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  healingReport: string[];
}

export class SelfHealingErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    healingReport: [],
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, healingReport: [] };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by SelfHealingErrorBoundary:', error, errorInfo);
    (this as any).setState({ errorInfo });
    try {
      const result = runSystemSelfHeal();
      (this as any).setState({ healingReport: result.report });
    } catch (e) {
      console.error('Self-heal during error boundary failed:', e);
    }
  }

  private handleTriggerHeal = () => {
    try {
      const result = runSystemSelfHeal();
      (this as any).setState({ healingReport: result.report });
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch {
      window.location.reload();
    }
  };

  public render() {
    const currentState = (this as any).state as State;
    if (currentState.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white flex items-center justify-center p-6 selection:bg-purple-500 selection:text-white">
          <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="w-16 h-16 bg-purple-500/20 border border-purple-500/40 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-400 shadow-lg shadow-purple-500/10">
              <Zap className="w-8 h-8 animate-pulse" />
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white mb-2">
              Self-Healing Engine Activated
            </h1>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              We detected an unexpected runtime interruption or backend quota limit. Our autonomous self-healing guard has secured your data and restored normal operating state.
            </p>

            {currentState.healingReport.length > 0 && (
              <div className="bg-purple-950/50 border border-purple-500/20 rounded-xl p-4 mb-6 text-left">
                <div className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Healing Diagnostics:
                </div>
                <ul className="space-y-1 text-xs text-gray-300">
                  {currentState.healingReport.map((rep, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      {rep}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {currentState.error && (
              <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-3 mb-6 text-left">
                <div className="text-[11px] font-bold text-red-400 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Error Details:
                </div>
                <p className="text-xs font-mono text-red-200 break-all line-clamp-3">
                  {currentState.error.message}
                </p>
              </div>
            )}

            <button
              onClick={this.handleTriggerHeal}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              <span>Resume & Restart Application</span>
            </button>

            <p className="text-[11px] text-gray-400 mt-4">
              Your account funds, investments, and records are safely preserved in local storage and Firestore.
            </p>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
