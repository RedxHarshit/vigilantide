import { Code2, GitBranch, AlertTriangle, Database, Settings } from 'lucide-react';

const navItems = [
  { id: 'code', icon: Code2, label: 'Code Editor' },
  { id: 'architecture', icon: GitBranch, label: 'Architecture Map' },
  { id: 'incidents', icon: AlertTriangle, label: 'Incident History' },
  { id: 'memory', icon: Database, label: 'Memory Banks' },
];

export default function LeftSidebar({ activeView, onViewChange, onSettingsClick }) {
  return (
    <nav className="w-16 bg-[#0b1120] border-r border-border-subtle flex flex-col items-center py-4 gap-2 flex-shrink-0 z-20">
      {/* Logo Block */}
      <div className="w-10 h-10 mb-4 rounded-xl bg-accent flex items-center justify-center shadow-[0_0_15px_var(--color-accent-glow)]">
        <span className="font-bold text-lg text-white font-mono">K</span>
      </div>

      {navItems.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          id={`nav-${id}`}
          onClick={() => onViewChange(id)}
          title={label}
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 relative
            ${activeView === id
              ? 'text-accent shadow-[inset_2px_0_0_var(--color-accent)] bg-accent/5'
              : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
            }
          `}
        >
          <Icon className="w-[18px] h-[18px]" />
        </button>
      ))}

      <div className="flex-1" />

      <button
        id="nav-settings"
        onClick={onSettingsClick}
        title="Settings"
        className="w-10 h-10 rounded-lg flex items-center justify-center text-text-muted hover:text-text-secondary hover:bg-bg-elevated transition-all duration-200"
      >
        <Settings className="w-[18px] h-[18px]" />
      </button>
    </nav>
  );
}
