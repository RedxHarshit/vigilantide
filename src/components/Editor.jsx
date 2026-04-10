import Editor from '@monaco-editor/react';

const DEFAULT_CODE = `// jobs/processor.js — Vigilant IDE Demo
// Try editing this code to trigger the Vigilant Agent

async function processOrder(order) {
  // Pattern: System Latency Pattern #402
  // (Order Processing Delay)
  while (true) {
    try {
      const result = await backend.submit(order);
      return result;
    } catch (err) {
      // No backoff — will hammer the backend!
      console.log("Order failed, retrying...");
      continue;
    }
  }
}

async function searchUsers(query) {
  // Pattern: Data Query Pattern #108
  // (Unparameterized String Construction)
  const sql = "SELECT * FROM users WHERE name = '" + query + "'";
  return await db.query(sql);
}

function handleConnection(ws) {
  // Pattern: Resource Cleanup Pattern #215
  // (Active Reference Tracking)
  const clientId = generateId();
  clients.set(clientId, ws);
  // Missing: cleanup on disconnect!
}

app.use((req, res, next) => {
  // Pattern: Metadata Logging Pattern #067
  // (Sensitive Field Visualization)
  console.log("Request body:", JSON.stringify(req.body));
  next();
});
`;

export default function EditorPanel({ code, onChange, agentState, onApplyFix }) {
  const proposal = agentState?.proposal;
  
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      {/* Tab bar */}
      <div className="h-10 bg-[#090d14] border-b border-border-subtle flex items-center px-4 flex-shrink-0 gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-bg-elevated/30 border border-border-subtle border-b-0 text-xs font-mono font-medium text-accent">
          <span className="text-accent/50">#</span>
          payment/processor.js
          <span className="text-text-muted hover:text-text-primary ml-2 cursor-pointer">×</span>
        </div>
        <div className="text-[9px] font-mono tracking-widest text-text-muted uppercase">
          SRC &gt; API &gt; CORE &gt; PAYMENT
        </div>
        <div className="ml-auto flex items-center gap-3 text-text-muted">
          <span className="w-4 h-4 rounded bg-bg-elevated flex items-center justify-center text-[10px]">E</span>
          <span className="w-4 h-4 rounded bg-bg-elevated flex items-center justify-center text-[10px]">T</span>
        </div>
      </div>

      {/* Popover overlay */}
      {proposal && (
        <div className="absolute top-1/4 left-1/4 z-10 w-[400px] bg-[#0b1120] border border-accent/30 rounded-xl shadow-[0_0_40px_rgba(56,189,248,0.15)] flex flex-col overflow-hidden animate-fade-in-up">
          <div className="p-3 border-b border-border-subtle flex items-center gap-3 bg-bg-surface/50">
             <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
               <span className="text-accent text-sm">✨</span>
             </div>
             <div>
               <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest">Healing Strategy</h3>
               <p className="text-[10px] text-text-muted mt-0.5">Injecting Hindsight Middleware...</p>
             </div>
          </div>
          
          <div className="p-4 bg-[#090d14]">
            <div className="text-[10px] font-mono leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap rounded border border-border-subtle p-3 bg-black/40">
              {(typeof proposal.text === 'string' ? proposal.text : JSON.stringify(proposal.text))
                .split('\n')
                .map((line, i) => {
                  if (line.startsWith('-')) return <div key={i} className="text-danger bg-danger/10 px-1 -mx-1">{line}</div>;
                  if (line.startsWith('+')) return <div key={i} className="text-success bg-success/10 px-1 -mx-1">{line}</div>;
                  return <div key={i} className="text-text-secondary">{line}</div>;
                })
              }
            </div>
            
            <div className="flex gap-3 mt-4">
               <button 
                 className="flex-1 py-2 rounded bg-bg-elevated hover:bg-border-subtle text-text-primary text-[10px] font-bold tracking-widest uppercase transition-colors border border-border-subtle"
                 onClick={() => { /* stub discard */ }}
               >
                 Discard
               </button>
               <button 
                 onClick={onApplyFix}
                 className="flex-1 py-2 rounded bg-accent hover:bg-accent-light text-bg-deep text-[10px] font-bold tracking-widest uppercase shadow-[0_0_15px_var(--color-accent-glow)] transition-all"
               >
                 Deploy Fix
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0 bg-[#090d14]">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code || DEFAULT_CODE}
          onChange={(val) => onChange?.(val || '')}
          theme="vs-dark"
          options={{
            fontSize: 13.5,
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 22,
            minimap: { enabled: true, scale: 1 },
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            renderLineHighlight: 'all',
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            bracketPairColorization: { enabled: true },
            suggest: { showKeywords: true },
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
}

export { DEFAULT_CODE };
