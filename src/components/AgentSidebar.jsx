import { Search, Brain, Wrench, CheckCircle, ShieldCheck, AlertCircle, Loader2, Zap, Lock } from 'lucide-react';
import { AGENT_PHASES } from '../engine/agent';
import RecallCard from './RecallCard';
import VigilantAlert from './VigilantAlert';
import ArchMap from './ArchMap';

const steps = [
  { phase: AGENT_PHASES.SEARCHING, icon: Search, label: 'Search Memory', description: 'Querying Hindsight for past incidents' },
  { phase: AGENT_PHASES.ANALYZING, icon: Brain, label: 'Analyze Architecture', description: 'Checking dependency risks' },
  { phase: AGENT_PHASES.PROPOSING, icon: Wrench, label: 'Generate Fix', description: 'Creating architecture-safe patch' },
  { phase: AGENT_PHASES.REFLECTING, icon: ShieldCheck, label: 'Verify Safety', description: 'Cross-checking against known vulns' },
  { phase: AGENT_PHASES.COMPLETE, icon: CheckCircle, label: 'Complete', description: 'Analysis finished' },
];

function getStepStatus(stepPhase, currentPhase) {
  const order = [AGENT_PHASES.SEARCHING, AGENT_PHASES.ANALYZING, AGENT_PHASES.PROPOSING, AGENT_PHASES.REFLECTING, AGENT_PHASES.COMPLETE];
  const stepIdx = order.indexOf(stepPhase);
  const currentIdx = order.indexOf(currentPhase);
  if (currentIdx < 0) return 'pending'; // IDLE or ERROR
  
  if (currentPhase === AGENT_PHASES.COMPLETE) {
    return 'complete';
  }

  if (stepIdx < currentIdx) return 'complete';
  if (stepIdx === currentIdx) return 'active';
  return 'pending';
}

export default function AgentSidebar({ agentState, onApplyFix }) {
  const { phase, incidents, architectureDeps, proposal, reflection, message } = agentState;
  const isIdle = phase === AGENT_PHASES.IDLE;
  const isError = phase === AGENT_PHASES.ERROR;

  return (
    <aside className="w-80 bg-bg-surface border-l border-border-subtle flex flex-col flex-shrink-0 overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border-subtle flex-shrink-0">
        <h2 className="text-xs font-bold tracking-widest uppercase text-accent flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Agent Intelligence
        </h2>
        {message && (
          <p className="text-[11px] text-text-muted mt-1 leading-snug">{message}</p>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Step Indicators */}
        <div>
          <h3 className="text-[10px] font-mono font-semibold text-text-muted tracking-widest uppercase mb-4 px-1">
            Reasoning Chain
          </h3>
          <div className="relative space-y-4 px-1">
            {/* Vertical Connecting Line */}
            <div className="absolute left-4 top-4 bottom-4 w-[1px] bg-border-subtle -z-10"></div>
            
            {steps.map(({ phase: stepPhase, label, description }) => {
              const status = getStepStatus(stepPhase, phase);
              return (
                <div key={stepPhase} className="flex items-start gap-4">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 bg-bg-deep border
                    ${status === 'active' ? 'border-accent text-accent shadow-[0_0_15px_var(--color-accent-glow)]' :
                      status === 'complete' ? 'border-text-secondary text-text-secondary' :
                      'border-border-subtle text-border-subtle opacity-50'}
                  `}>
                    {status === 'active' ? (
                      <Zap className="w-3.5 h-3.5 fill-accent/20" />
                    ) : status === 'complete' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className={`text-xs font-bold font-sans tracking-wide ${status === 'active' ? 'text-accent' : status === 'complete' ? 'text-text-primary' : 'text-text-muted opacity-50'}`}>
                      {label}
                    </p>
                    <p className={`text-[10px] truncate max-w-[200px] ${status === 'active' ? 'text-text-secondary' : 'text-text-muted'}`}>
                      {status === 'pending' ? 'Pending active synthesis.' : description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error State */}
        {isError && (
          <div className="glass-card p-3 border-danger/30">
            <div className="flex items-center gap-2 text-danger text-xs">
              <AlertCircle className="w-4 h-4" />
              <span className="font-semibold">Agent Error</span>
            </div>
            <p className="text-[11px] text-text-muted mt-1">{agentState.error}</p>
          </div>
        )}

        {/* Idle State */}
        {isIdle && (
          <div className="glass-card p-4 text-center">
            <Brain className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-30" />
            <p className="text-xs text-text-muted">
              Edit code in the editor to trigger<br />
              the Vigilant Agent scan
            </p>
          </div>
        )}

        {/* Recall Cards — Incident Memory */}
        {incidents.length > 0 && (
          <div>
            <h3 className="text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-2">
              📑 Recalled Incidents ({incidents.length})
            </h3>
            <div className="space-y-2">
              {incidents.slice(0, 5).map((inc, i) => (
                <RecallCard key={inc.id || i} incident={inc} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Architecture Map */}
        {architectureDeps.length > 0 && (
          <ArchMap deps={architectureDeps} />
        )}

        {/* Vigilant Alert & Fix */}
        {proposal && (
          <VigilantAlert
            proposal={proposal}
            reflection={reflection}
            onApplyFix={onApplyFix}
          />
        )}
      </div>
    </aside>
  );
}
