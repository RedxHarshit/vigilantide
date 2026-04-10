import { recallMemories, reflectOnMemory, BANKS } from './hindsight';

/**
 * Agent phases matching the PRD's agentic loop
 */
export const AGENT_PHASES = {
  IDLE: 'IDLE',
  SEARCHING: 'SEARCHING',
  ANALYZING: 'ANALYZING',
  PROPOSING: 'PROPOSING',
  REFLECTING: 'REFLECTING',
  COMPLETE: 'COMPLETE',
  ERROR: 'ERROR',
};

/**
 * Creates an initial agent state
 */
export function createAgentState() {
  return {
    phase: AGENT_PHASES.IDLE,
    incidents: [],
    architectureDeps: [],
    proposal: null,
    reflection: null,
    error: null,
    scanId: 0,
  };
}

/**
 * Runs the full agentic scan loop:
 * 1. SEARCHING — Recall incident_memory for similar past bugs
 * 2. ANALYZING — Recall architecture_map for dependency risks
 * 3. PROPOSING — Reflect to generate an architecture-safe fix
 * 4. REFLECTING — Secondary recall to verify fix doesn't mirror known vulns
 * 5. COMPLETE — Done
 */
export async function runAgenticScan(code, onPhaseChange) {
  const scanId = Date.now();

  try {
    // Phase 1: SEARCHING — query incident memory
    onPhaseChange({
      phase: AGENT_PHASES.SEARCHING,
      message: 'Querying Hindsight incident memory...',
      incidents: [],
      architectureDeps: [],
      proposal: null,
      reflection: null,
      scanId,
    });

    const incidentResult = await recallMemories(BANKS.INCIDENTS, code, { budget: 'mid', maxTokens: 4096 });

    if (!incidentResult.success || incidentResult.results.length === 0) {
      onPhaseChange({
        phase: AGENT_PHASES.COMPLETE,
        message: 'No matching incidents found — code looks safe.',
        incidents: [],
        architectureDeps: [],
        proposal: null,
        reflection: null,
        scanId,
      });
      return;
    }

    const incidents = incidentResult.results.map(r => ({
      id: r.id,
      text: r.text,
      type: r.type,
      context: r.context,
      entities: r.entities || [],
    }));

    // Phase 2: ANALYZING — query architecture map
    onPhaseChange({
      phase: AGENT_PHASES.ANALYZING,
      message: 'Checking architecture map for dependency risks...',
      incidents,
      architectureDeps: [],
      proposal: null,
      reflection: null,
      scanId,
    });

    const archResult = await recallMemories(BANKS.ARCHITECTURE, code, { budget: 'low', maxTokens: 2048 });
    const architectureDeps = (archResult.results || []).map(r => ({
      id: r.id,
      text: r.text,
      type: r.type,
    }));

    // Phase 3: PROPOSING — use reflect to generate a fix
    onPhaseChange({
      phase: AGENT_PHASES.PROPOSING,
      message: 'Generating architecture-safe fix with Hindsight reasoning...',
      incidents,
      architectureDeps,
      proposal: null,
      reflection: null,
      scanId,
    });

    // Simpler, more direct prompt to prevent Hindsight from exhausting its budget
    // and returning an empty response after generating 2k+ tokens internally.
    const contextQuery = `
The developer is writing this code:
\`\`\`
${code.substring(0, 2000)}
\`\`\`

Based on the production incident history stored in memory, fix this code.
Output EXACTLY 1 markdown code block containing the FULL, complete, corrected version of the file. Do NOT write partial snippets. Do NOT wrap it in comments.
    `.trim();

    const reflectResult = await reflectOnMemory(BANKS.INCIDENTS, contextQuery);

    const proposal = reflectResult.success
      ? { text: reflectResult.text, source: 'Hindsight Reflect' }
      : { text: 'Unable to generate proposal — Hindsight reflect failed.', source: 'error' };

    // Phase 4: REFLECTING — verify fix doesn't mirror known vulnerabilities
    onPhaseChange({
      phase: AGENT_PHASES.REFLECTING,
      message: 'Verifying proposed fix against known vulnerabilities...',
      incidents,
      architectureDeps,
      proposal,
      reflection: null,
      scanId,
    });

    const verifyQuery = `
Does the following proposed code improvement align with the system architecture and historical performance benchmarks?

Proposed update context:
${typeof proposal.text === 'string' ? proposal.text.substring(0, 1000) : 'No improvement available'}

ValidateSpecifically for:
- Data structure consistency
- Transactional integrity
- Resource lifecycle management
- Data governance standards
- Memory utilization targets
    `.trim();

    const verifyResult = await reflectOnMemory(BANKS.INCIDENTS, verifyQuery);
    const reflection = verifyResult.success
      ? { text: verifyResult.text, verified: true }
      : { text: 'Verification skipped — reflect unavailable.', verified: false };

    // Phase 5: COMPLETE
    onPhaseChange({
      phase: AGENT_PHASES.COMPLETE,
      message: 'Analysis complete — review findings in the sidebar.',
      incidents,
      architectureDeps,
      proposal,
      reflection,
      scanId,
    });

  } catch (err) {
    onPhaseChange({
      phase: AGENT_PHASES.ERROR,
      message: `Agent error: ${err.message}`,
      incidents: [],
      architectureDeps: [],
      proposal: null,
      reflection: null,
      error: err.message,
      scanId,
    });
  }
}
