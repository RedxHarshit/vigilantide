import { AlertTriangle, FileWarning } from 'lucide-react';

export default function RecallCard({ incident, index }) {
  if (!incident) return null;

  const text = incident.text || '';
  // Try to extract incident ID from text
  const idMatch = text.match(/(?:Incident\s+)?(INC-\d+|#\d+)/i);
  const incidentId = idMatch ? idMatch[1] : `Memory #${index + 1}`;

  return (
    <div
      className="glass-card p-3 animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg bg-danger/10 flex items-center justify-center">
          <FileWarning className="w-3.5 h-3.5 text-danger" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-accent tracking-wide uppercase">
              Recall: {incidentId}
            </span>
            <span className="text-[10px] text-text-muted">
              {incident.type === 'observation' ? '🧠 Observation' : incident.type === 'experience' ? '📋 Experience' : '🌍 Fact'}
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed line-clamp-4">
            {text}
          </p>
          {incident.entities?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {incident.entities.slice(0, 4).map((e, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-accent/10 text-accent border border-accent/20">
                  {e}
                </span>
              ))}
            </div>
          )}
          <div className="mt-1.5 text-[10px] text-text-muted flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Retrieved from Hindsight Memory
          </div>
        </div>
      </div>
    </div>
  );
}
