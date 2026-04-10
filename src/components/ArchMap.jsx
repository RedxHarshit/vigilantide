import { GitBranch, ShieldCheck, ShieldAlert, Cloud, Network } from 'lucide-react';

const riskColors = {
  HIGH: { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/30' },
  MEDIUM: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30' },
  LOW: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30' },
};

export default function ArchMap({ deps }) {
  if (!deps || deps.length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="text-[10px] font-mono font-semibold text-text-muted tracking-widest uppercase mb-3 px-1">
        Architecture Heatmap
      </h3>

      <div className="grid grid-cols-2 gap-2 mb-2">
        {deps.slice(0, 2).map((dep, i) => {
          const text = dep.text || '';
          const isHighRisk = text.match(/HIGH/i) || i === 0; // force high risk style for first if mock
          
          return (
            <div
              key={i}
              className={`p-3 rounded flex flex-col items-center justify-center text-center border ${
                isHighRisk ? 'bg-danger/5 border-danger/20' : 'bg-bg-elevated/50 border-border-subtle'
              }`}
            >
              <div className={`text-[9px] font-bold tracking-widest uppercase mb-2 ${isHighRisk ? 'text-danger' : 'text-accent'}`}>
                {isHighRisk ? 'High Risk' : 'Stable'}
              </div>
              {isHighRisk ? <ShieldAlert className="w-5 h-5 text-danger mb-1" /> : <Cloud className="w-5 h-5 text-accent mb-1" />}
              <div className="text-[10px] font-mono text-text-primary mt-1">tx_engine</div>
            </div>
          );
        })}
      </div>
      
      {deps.length > 2 && (
        <div className="p-3 rounded bg-[#0d1526] border border-border-subtle flex flex-col items-center text-center">
          <div className="flex items-center gap-3">
             <Network className="w-5 h-5 text-accent" />
             <div className="text-left">
                <div className="text-[10px] font-bold text-accent tracking-widest uppercase">API_GATEWAY</div>
                <div className="text-[9px] text-text-muted font-mono mt-0.5">324 requests/s</div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
