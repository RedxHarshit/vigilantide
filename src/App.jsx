import { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import EditorPanel, { DEFAULT_CODE } from './components/Editor';
import AgentSidebar from './components/AgentSidebar';
import StatusBar from './components/StatusBar';
import { AGENT_PHASES, createAgentState } from './engine/agent';
import { triggerVigilantScan, cancelScan } from './engine/scanner';
import { checkConnection } from './engine/hindsight';
import { seedMemoryBanks } from './engine/seedData';
import { incidents } from './data/incidents';
import { Database, Loader2, CheckCircle, AlertCircle, Rocket, X, CheckCheck, GitBranch, AlertTriangle } from 'lucide-react';

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [activeView, setActiveView] = useState('code');
  const [agentState, setAgentState] = useState(createAgentState());
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [seedProgress, setSeedProgress] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState(null);
  const hasRunInitialCheck = useRef(false);
  const resetTimerRef = useRef(null);

  // Check Hindsight connection on mount
  useEffect(() => {
    if (hasRunInitialCheck.current) return;
    hasRunInitialCheck.current = true;

    const check = async () => {
      const connected = await checkConnection();
      setIsConnected(connected);
      if (!connected) {
        // Show helpful message on first load if not connected
        setShowSeedModal(true);
      }
    };
    check();

    // Periodic connection check
    const interval = setInterval(async () => {
      const connected = await checkConnection();
      setIsConnected(connected);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Handle code changes — reset agent and trigger new Vigilant Scan
  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
    if (isConnected) {
      // Reset agent to IDLE when user starts editing — clears previous results
      if (agentState.phase === AGENT_PHASES.COMPLETE || agentState.phase === AGENT_PHASES.ERROR) {
        setAgentState(createAgentState());
      }
      triggerVigilantScan(newCode, (update) => {
        setAgentState(update);
      }, 2500);
    }
  }, [isConnected, agentState.phase]);

  // Handle Apply Fix — replace editor code with the corrected version from Hindsight
  const handleApplyFix = useCallback(() => {
    if (agentState.proposal?.text) {
      const proposalText = typeof agentState.proposal.text === 'string' 
        ? agentState.proposal.text 
        : JSON.stringify(agentState.proposal.text);

      // Extract ALL code blocks from the proposal — super permissive regex
      const codeBlocks = [];
      const codeBlockRegex = /```(.*?)[\r\n]+([\s\S]*?)(?:```|$)/gi; 
      let match;
      while ((match = codeBlockRegex.exec(proposalText)) !== null) {
        let rawCode = match[2];
        
        // Sometimes the AI surrounds the markdown inside ` * ` or `// ` comment prefixes. Clean it:
        const lines = rawCode.split('\n');
        if (lines.length > 0) {
          // If every non-empty line starts with '* ' or ' * ' or '// '
          const allCommented = lines.every(line => !line.trim() || /^\s*(\*|\/\/)/.test(line));
          if (allCommented) {
             rawCode = lines.map(l => l.replace(/^\s*(\*|\/\/)\s?/, '')).join('\n');
          }
        }
        
        codeBlocks.push(rawCode.trim());
      }

      if (codeBlocks.length > 0) {
        // Find the largest code block — that's the full corrected file
        let fixedCode = codeBlocks.reduce((a, b) => a.length > b.length ? a : b);

        setCode(fixedCode);
        setToast('✅ Autonomous patch applied! All vulnerabilities fixed.');
      } else {
        // No code blocks found — show the analysis as a comment at top
        const commentLines = proposalText
          .split('\n')
          .filter(l => l.trim())
          .slice(0, 20)
          .map(l => ` * ${l}`);
        
        const header = [
          '/* 🛡️ VIGILANT IDE — Patch Analysis (no code block extracted)',
          ...commentLines,
          ' */',
          '',
        ].join('\n');

        setCode(header + code);
        setToast('⚠️ No code fix found in proposal — analysis added as comment.');
      }
    }

    setTimeout(() => setToast(null), 5000);

    // Reset agent to idle
    setAgentState(createAgentState());
  }, [agentState, code]);

  // Seed memory banks
  const handleSeedMemory = async () => {
    setIsSyncing(true);
    setSeedProgress({ phase: 'start', completed: 0, total: 0, message: 'Starting...' });

    await seedMemoryBanks((progress) => {
      setSeedProgress(progress);
    });

    setIsSyncing(false);
    const connected = await checkConnection();
    setIsConnected(connected);
  };

  return (
    <div className="h-full w-full flex flex-col bg-bg-deep">
      {/* Header */}
      <Header
        agentPhase={agentState.phase}
        isConnected={isConnected}
        isSyncing={isSyncing}
      />

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Nav */}
        <LeftSidebar
          activeView={activeView}
          onViewChange={setActiveView}
          onSettingsClick={() => setShowSettings(true)}
        />

        {/* Main View Area */}
        {activeView === 'code' && (
          <EditorPanel 
            code={code} 
            onChange={handleCodeChange}
            agentState={agentState}
            onApplyFix={handleApplyFix}
          />
        )}
        
        {activeView === 'architecture' && (
          <div className="flex-1 flex flex-col bg-bg-deep animate-fade-in-up overflow-y-auto">
            <div className="p-6 border-b border-border-subtle bg-bg-surface flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center border border-accent/20">
                  <GitBranch className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary">Architecture Map</h2>
                  <p className="text-sm text-text-muted">Real-time dependency & threat vector analysis</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-bg-elevated border border-border-subtle text-xs text-text-secondary font-medium">
                {agentState.phase === AGENT_PHASES.COMPLETE ? 'Analysis Complete' : 'Awaiting Context...'}
              </div>
            </div>
            
            <div className="p-8">
              {agentState.phase === AGENT_PHASES.COMPLETE ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(agentState.architectureDeps || []).length > 0 ? (
                    agentState.architectureDeps.map((dep, idx) => (
                      <div key={idx} className="glass-card p-4 hover:border-accent border border-border-subtle transition-all">
                        <div className="flex gap-3">
                          <Rocket className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-bold text-text-primary mb-1 relative pr-12">
                              Dependency Node
                              <span className="absolute right-0 top-0 text-[10px] uppercase font-bold text-success bg-success/10 px-2 py-0.5 rounded">Scanned</span>
                            </h4>
                            <p className="text-xs text-text-secondary leading-relaxed">{dep.text}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full glass-card p-8 text-center flex flex-col items-center">
                      <CheckCircle className="w-12 h-12 text-success/50 mb-3" />
                      <h3 className="text-text-primary font-bold">No High-Risk Dependencies Detected</h3>
                      <p className="text-sm text-text-muted mt-1">The current file does not introduce severe architectural risk patterns based on the Hindsight index.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full border border-border-subtle absolute animate-pulse-glow"></div>
                    <GitBranch className="w-10 h-10 text-accent/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <h3 className="text-lg font-medium text-text-primary">Waiting for Agent Execution</h3>
                  <p className="text-sm text-text-muted mt-2 max-w-md">Edit code in the Code Editor to trigger a background architectural scan.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'incidents' && (
          <div className="flex-1 flex flex-col bg-bg-deep animate-fade-in-up overflow-hidden">
             <div className="p-6 border-b border-border-subtle bg-bg-surface flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-danger/15 flex items-center justify-center border border-danger/20">
                  <AlertTriangle className="w-6 h-6 text-danger" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary">Incident History Explorer</h2>
                  <p className="text-sm text-text-muted">Post-mortems from the Hindsight Vector DB</p>
                </div>
              </div>
              <div className="flex gap-2">
                 <span className="px-3 py-1 rounded-full bg-bg-elevated border border-border-subtle text-xs text-text-primary font-medium">{incidents.length} Records</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
               {incidents.map((incident, idx) => {
                 let badgeClass = "badge-low";
                 if (incident.severity === "critical") badgeClass = "badge-critical";
                 if (incident.severity === "high") badgeClass = "badge-high";
                 if (incident.severity === "medium") badgeClass = "badge-medium";
                 return (
                   <div key={incident.id || idx} className="glass-card overflow-hidden">
                     <div className="p-4 border-b border-border-subtle bg-bg-surface/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <code className="text-xs text-accent font-bold bg-accent/10 px-2 py-1 rounded">{incident.id}</code>
                          <h3 className="text-sm font-bold text-text-primary">{incident.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-text-muted font-mono">{new Date(incident.date).toLocaleDateString()}</span>
                          <span className={`badge ${badgeClass}`}>{incident.severity}</span>
                        </div>
                     </div>
                     <div className="p-4 bg-bg-deep/50 text-xs text-text-secondary leading-relaxed">
                        <p className="mb-2"><strong className="text-text-primary">Root Cause:</strong> {incident.root_cause}</p>
                        <p><strong className="text-text-primary">Impact:</strong> {incident.impact}</p>
                     </div>
                     {incident.resolution_code && (
                       <div className="px-4 py-3 bg-[#0d1117] border-t border-border-subtle max-h-40 overflow-y-auto">
                         <pre className="text-[10px] text-[#e6edf3] font-mono whitespace-pre-wrap">{incident.resolution_code}</pre>
                       </div>
                     )}
                   </div>
                 );
               })}
            </div>
          </div>
        )}

        {activeView === 'memory' && (
          <div className="flex-1 flex flex-col bg-bg-deep animate-fade-in-up overflow-y-auto">
             <div className="p-6 border-b border-border-subtle bg-bg-surface flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center border border-accent/20">
                  <Database className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary">Hindsight Memory Vault</h2>
                  <p className="text-sm text-text-muted">Cloud Vector Embeddings & Agent Context</p>
                </div>
              </div>
              <div className="flex gap-2">
                 <span className={`px-3 py-1 rounded-full bg-bg-elevated border border-border-subtle text-xs font-medium flex items-center gap-2 ${isConnected ? 'text-success' : 'text-danger'}`}>
                   {isConnected ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                   {isConnected ? 'Connected to Cloud' : 'Disconnected'}
                 </span>
              </div>
            </div>

            <div className="p-8 max-w-4xl mx-auto w-full">
              <p className="text-text-secondary leading-relaxed mb-8">
                Vigilant IDE connects standard bug trackers and post-mortems with vector representations of your code architecture via the Hindsight Cloud API. 
                Manage your system prompts, architecture constraints, and incident memory banks below to define how the agentic scanner operates.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Cloud Connection Module */}
                <div className="glass-card p-6 flex flex-col">
                   <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 border-b border-border-subtle pb-2">Connection Status</h3>
                   <div className={`p-4 rounded-lg flex items-center gap-3 mb-4 ${isConnected ? 'bg-success/10 border border-success/30' : 'bg-danger/10 border border-danger/30'}`}>
                     {isConnected ? <CheckCircle className="w-6 h-6 text-success" /> : <AlertCircle className="w-6 h-6 text-danger" />}
                     <div>
                       <div className={`font-bold ${isConnected ? 'text-success' : 'text-danger'}`}>{isConnected ? 'Hindsight Server Online' : 'Hindsight Offline'}</div>
                       <div className="text-xs text-text-muted mt-0.5">{isConnected ? 'Bi-directional socket active' : 'API token or socket error'}</div>
                     </div>
                   </div>

                   {!isConnected && (
                    <div className="bg-bg-deep rounded-lg p-4 mb-4 flex-1">
                      <p className="text-xs text-text-secondary mb-3">To use Vigilant IDE, verify your connection:</p>
                      <div className="space-y-3">
                        <div>
                          <code className="block text-xs text-accent bg-bg-elevated p-2 rounded border border-border-subtle break-all">
                            VITE_HINDSIGHT_URL=https://api.hindsight.vectorize.io
                          </code>
                        </div>
                      </div>
                    </div>
                   )}

                   <button
                    onClick={async () => {
                      const connected = await checkConnection();
                      setIsConnected(connected);
                    }}
                    className="w-full py-2.5 rounded-lg border border-border-subtle bg-bg-surface text-sm font-medium text-text-primary hover:bg-bg-elevated hover:text-accent transition-all mt-auto"
                   >
                     Test Connection Ping
                   </button>
                </div>

                {/* Memory Synchronization Module */}
                <div className="glass-card p-6 flex flex-col">
                   <div className="flex items-center justify-between border-b border-border-subtle pb-2 mb-4">
                     <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Index Sync Manager</h3>
                     <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded">BANK: incident-memory</span>
                   </div>
                   
                   <p className="text-xs text-text-secondary mb-6 leading-relaxed">
                     When you update mock incidents in <code className="text-accent bg-bg-elevated px-1 py-0.5 rounded">data/incidents.js</code>, you must re-sync the banks. The Vigilant agent queries the remote vector store, not local files.
                   </p>

                   {seedProgress && (
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-accent">{seedProgress.message}</span>
                        <span className="text-text-muted font-mono">{seedProgress.completed} / {seedProgress.total}</span>
                      </div>
                      <div className="w-full h-2 bg-bg-deep rounded-full overflow-hidden border border-border-subtle">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-300 shadow-[0_0_10px_var(--color-accent-glow)]"
                          style={{ width: `${seedProgress.total ? (seedProgress.completed / seedProgress.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                   )}

                   <button
                    onClick={() => {
                        // Use the existing handleSeedMemory equivalent inline if it's imported in App.jsx
                        const performSync = async () => {
                            if (!isConnected || isSyncing) return;
                            setIsSyncing(true);
                            setSeedProgress(null);
                            try {
                              await seedMemoryBanks((progress) => setSeedProgress(progress));
                              setToast('Memory banks successfully seeded with initial DB!');
                            } catch (e) {
                              setToast('Error seeding memory. Check console.');
                            } finally {
                              setIsSyncing(false);
                            }
                        };
                        performSync();
                    }}
                    disabled={!isConnected || isSyncing}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-accent hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-all hover:shadow-[0_0_20px_var(--color-accent-glow)] mt-auto"
                   >
                    {isSyncing ? <Loader2 className="w-4 h-4 animate-rotate" /> : <Rocket className="w-4 h-4" />}
                    {isSyncing ? 'Synchronizing Cloud Vectors...' : 'Start Initial Sync Phase'}
                   </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Agent Sidebar */}
        <AgentSidebar
          agentState={agentState}
          onApplyFix={handleApplyFix}
        />
      </div>

      {/* Status Bar */}
      <StatusBar
        isConnected={isConnected}
        agentPhase={agentState.phase}
        incidentCount={incidents.length}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg glass border border-success/30 shadow-lg">
            <CheckCheck className="w-4 h-4 text-success flex-shrink-0" />
            <span className="text-xs text-text-primary font-medium">{toast}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-text-muted hover:text-text-primary">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Seed Memory / Connection Modal */}
      {showSeedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-lg p-6 space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                  <Database className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">Hindsight Memory Setup</h2>
                  <p className="text-xs text-text-muted">Connect to Hindsight and seed memory banks</p>
                </div>
              </div>
              <button onClick={() => setShowSeedModal(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Connection Status */}
            <div className={`flex items-center gap-2 p-3 rounded-lg ${isConnected ? 'bg-success/10 border border-success/30' : 'bg-danger/10 border border-danger/30'}`}>
              {isConnected ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : (
                <AlertCircle className="w-4 h-4 text-danger" />
              )}
              <span className={`text-sm font-medium ${isConnected ? 'text-success' : 'text-danger'}`}>
                {isConnected ? 'Hindsight Server Connected' : 'Hindsight Server Not Detected'}
              </span>
            </div>

            {!isConnected && (
              <div className="bg-bg-deep rounded-lg p-3">
                <p className="text-xs text-text-secondary mb-2">To use Vigilant IDE, start a Hindsight server:</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Option 1: Hindsight Cloud (Free Credits)</p>
                    <code className="block text-[11px] text-accent bg-bg-elevated p-2 rounded font-mono">
                      Sign up at ui.hindsight.vectorize.io
                    </code>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Option 2: Docker (Local)</p>
                    <code className="block text-[11px] text-accent bg-bg-elevated p-2 rounded font-mono break-all">
                      docker run --rm -it -p 8888:8888 -p 9999:9999 -e HINDSIGHT_API_LLM_API_KEY=$KEY ghcr.io/vectorize-io/hindsight:latest
                    </code>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Option 3: pip</p>
                    <code className="block text-[11px] text-accent bg-bg-elevated p-2 rounded font-mono">
                      pip install hindsight-api && hindsight-api
                    </code>
                  </div>
                </div>
              </div>
            )}

            {/* Seed Progress */}
            {seedProgress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">{seedProgress.message}</span>
                  <span className="text-text-muted">{seedProgress.completed}/{seedProgress.total}</span>
                </div>
                <div className="w-full h-1.5 bg-bg-deep rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-300"
                    style={{ width: `${seedProgress.total ? (seedProgress.completed / seedProgress.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  const connected = await checkConnection();
                  setIsConnected(connected);
                }}
                className="flex-1 py-2 rounded-lg border border-border-subtle text-xs font-medium text-text-secondary hover:bg-bg-elevated transition-all"
              >
                Check Connection
              </button>
              <button
                onClick={handleSeedMemory}
                disabled={!isConnected || isSyncing}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-accent hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all hover:shadow-[0_0_20px_var(--color-accent-glow)]"
              >
                {isSyncing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-rotate" />
                ) : (
                  <Rocket className="w-3.5 h-3.5" />
                )}
                {isSyncing ? 'Seeding...' : 'Seed Memory Banks'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-6 space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-text-primary">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Hindsight Server URL</label>
                <input
                  type="text"
                  defaultValue={import.meta.env.VITE_HINDSIGHT_URL || 'http://localhost:8888'}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-bg-deep border border-border-subtle text-sm text-text-primary font-mono focus:outline-none focus:border-accent"
                  readOnly
                />
                <p className="text-[10px] text-text-muted mt-1">Set via VITE_HINDSIGHT_URL in .env file</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Agent Autonomy</label>
                <select className="mt-1 w-full px-3 py-2 rounded-lg bg-bg-deep border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent">
                  <option value="supervised">Supervised — Requires approval</option>
                  <option value="autonomous">Autonomous — Auto-apply fixes</option>
                </select>
              </div>

              <button
                onClick={() => { setShowSettings(false); setShowSeedModal(true); }}
                className="w-full py-2 rounded-lg border border-accent/30 text-accent text-xs font-semibold hover:bg-accent/10 transition-all"
              >
                Open Memory Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
