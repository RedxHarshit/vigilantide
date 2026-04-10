import { ShieldAlert, Zap, CheckCircle2 } from 'lucide-react';

export default function VigilantAlert({ proposal, reflection, onApplyFix }) {
  if (!proposal) return null;

  const isVerified = reflection?.verified;

  return (
    <div className="glass-card p-4 border border-danger/40 bg-bg-deep animate-fade-in-up">
      {/* Alert Header */}
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert className="w-4 h-4 text-danger" />
        <h4 className="text-[11px] font-bold tracking-widest uppercase text-danger">Vulnerability Detected</h4>
      </div>
      <p className="text-[10px] text-text-muted mb-3 leading-relaxed">
        CVE-2024-912: Potential unhandled exception leak in the pipeline could expose resources.
      </p>

      {/* Proposal */}
      <div className="bg-[#0b1120] border border-border-subtle rounded p-3 mb-3">
        <div className="text-[10px] font-mono leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
          {(typeof proposal.text === 'string' ? proposal.text : JSON.stringify(proposal.text))
            .split('\n')
            .map((line, i) => {
              if (line.startsWith('// WARNING') || line.startsWith('-')) {
                return <div key={i} className="text-danger">{line}</div>;
              }
              if (line.startsWith('// RESOLUTION') || line.startsWith('+')) {
                return <div key={i} className="text-success">{line}</div>;
              }
              return <div key={i} className="text-text-secondary">{line}</div>;
            })
          }
        </div>
      </div>

      {/* Verification Status */}
      {reflection && (
        <div className={`flex items-center gap-1.5 mb-2.5 text-[11px] ${isVerified ? 'text-success' : 'text-warning'}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="font-medium">
            {isVerified ? 'Fix verified safe by Hindsight reflection' : 'Verification not conclusive'}
          </span>
        </div>
      )}

      {/* Apply Fix Button */}
      <button
        id="apply-fix-btn"
        onClick={onApplyFix}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-accent/20 hover:bg-accent text-accent hover:text-bg-deep text-[11px] font-bold tracking-widest uppercase transition-all duration-300 border border-accent/50 hover:shadow-[0_0_20px_var(--color-accent-glow)] active:scale-[0.98]"
      >
        <Zap className="w-3.5 h-3.5" />
        Apply Autonomous Patch
      </button>
    </div>
  );
}
