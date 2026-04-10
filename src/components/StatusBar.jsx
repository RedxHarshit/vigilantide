import { RefreshCw } from 'lucide-react';

export default function StatusBar({ isConnected }) {
  return (
    <footer className="h-6 bg-[#090d14] border-t border-border-subtle flex items-center justify-between px-4 text-[10px] font-mono select-none flex-shrink-0 tracking-wider">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-accent font-bold">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success shadow-[0_0_8px_var(--color-success)]' : 'bg-danger'}`}></div>
          <span className={isConnected ? "text-success" : "text-danger"}>HINDSIGHT CLOUD {isConnected ? 'CONNECTED' : 'OFFLINE'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-muted">
          <RefreshCw className="w-3 h-3" />
          <span>VECTORS SYNCED</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-text-muted">
        <span>UTF-8</span>
        <span>JAVASCRIPT</span>
        <span className="text-accent font-bold shadow-text" style={{ textShadow: '0 0 8px rgba(56,189,248,0.5)' }}>VIGILANT MODE ACTIVE</span>
      </div>
    </footer>
  );
}
