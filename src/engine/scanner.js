import { runAgenticScan } from './agent';

let scanTimeout = null;

/**
 * The Vigilant Scan Engine
 * Implements: Extract → Recall → Reason → Warn/Fix
 *
 * Triggered on code changes with debounce to avoid over-querying Hindsight.
 */
export function triggerVigilantScan(code, onPhaseChange, debounceMs = 2000) {
  // Clear any pending scan
  if (scanTimeout) {
    clearTimeout(scanTimeout);
  }

  // Debounce the scan to wait for typing to settle
  scanTimeout = setTimeout(async () => {
    // Step 1: EXTRACT — get the active code snippet
    const snippet = code.trim();

    if (!snippet || snippet.length < 30) {
      // Too short to meaningfully scan
      return;
    }

    // Steps 2-4: RECALL → REASON → WARN/FIX  
    // Delegated to the agentic loop
    await runAgenticScan(snippet, onPhaseChange);
  }, debounceMs);
}

/**
 * Cancel any pending scan
 */
export function cancelScan() {
  if (scanTimeout) {
    clearTimeout(scanTimeout);
    scanTimeout = null;
  }
}
