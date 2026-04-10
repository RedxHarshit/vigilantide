import { Bell, Zap, User } from 'lucide-react';
import { AGENT_PHASES } from '../engine/agent';

const phaseLabels = {
  [AGENT_PHASES.IDLE]: 'Standby',
  [AGENT_PHASES.SEARCHING]: 'Searching Memory...',
  [AGENT_PHASES.ANALYZING]: 'Analyzing Dependencies...',
  [AGENT_PHASES.PROPOSING]: 'Generating Fix...',
  [AGENT_PHASES.REFLECTING]: 'Verifying Safety...',
  [AGENT_PHASES.COMPLETE]: 'Analysis Complete',
  [AGENT_PHASES.ERROR]: 'Error',
};

export default function Header() {
  const navLinks = ['Intelligence', 'Explorer', 'Terminal', 'Debug', 'Hindsight'];

  return (
    <header className="h-12 bg-bg-deep border-b border-border-subtle flex items-center justify-between px-6 select-none flex-shrink-0 z-20">
      {/* Horizontal Text Nav */}
      <div className="flex items-center gap-6">
        {navLinks.map((link, idx) => (
          <button 
            key={link} 
            className={`text-xs font-mono tracking-widest uppercase transition-colors ${
              idx === 0 
              ? 'text-text-primary font-bold shadow-text' 
              : 'text-text-muted hover:text-text-secondary'
            }`}
            style={idx === 0 ? { textShadow: '0 0 10px rgba(255,255,255,0.3)' } : {}}
          >
            {link}
          </button>
        ))}
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-4">
        <button className="text-text-muted hover:text-text-primary transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <button className="text-text-muted hover:text-text-primary transition-colors">
          <Zap className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-bg-elevated/50 border border-border-subtle cursor-pointer hover:border-border-glow transition-all">
          <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center">
            <User className="w-3 h-3 text-bg-deep" />
          </div>
          <span className="text-[10px] font-mono font-bold text-text-primary">OP_742</span>
        </div>
      </div>
    </header>
  );
}
