import { HindsightClient } from '@vectorize-io/hindsight-client';

// In dev, requests go through Vite proxy at /hindsight-api to avoid CORS.
// In production, set VITE_HINDSIGHT_URL to the actual cloud endpoint.
const IS_DEV = import.meta.env.DEV;
const CLOUD_URL = import.meta.env.VITE_HINDSIGHT_URL || 'https://api.hindsight.vectorize.io';
const HINDSIGHT_BASE_URL = IS_DEV ? '/hindsight-api' : CLOUD_URL;
const HINDSIGHT_API_KEY = import.meta.env.VITE_HINDSIGHT_API_KEY || '';

let client = null;

export function getClient() {
  if (!client) {
    client = new HindsightClient({
      baseUrl: HINDSIGHT_BASE_URL,
      ...(HINDSIGHT_API_KEY && { apiKey: HINDSIGHT_API_KEY }),
    });
  }
  return client;
}

export function resetClient(newUrl, newApiKey) {
  client = new HindsightClient({
    baseUrl: newUrl,
    ...(newApiKey && { apiKey: newApiKey }),
  });
  return client;
}

// Bank IDs matching the PRD
export const BANKS = {
  INCIDENTS: 'incident-memory',
  ARCHITECTURE: 'architecture-map',
};

/**
 * Retain content into a memory bank
 */
export async function retainMemory(bankId, content, options = {}) {
  const c = getClient();
  try {
    const result = await c.retain(bankId, content, {
      context: options.context || 'production incident',
      timestamp: options.timestamp,
      documentId: options.documentId,
    });
    return { success: true, result };
  } catch (err) {
    console.error('[Hindsight] Retain error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Recall memories by querying a bank
 */
export async function recallMemories(bankId, query, options = {}) {
  const c = getClient();
  try {
    const response = await c.recall(bankId, query, {
      maxTokens: options.maxTokens || 4096,
      budget: options.budget || 'mid',
    });
    return { success: true, results: response.results || [] };
  } catch (err) {
    console.error('[Hindsight] Recall error:', err);
    return { success: false, results: [], error: err.message };
  }
}

/**
 * Reflect — deep analysis via Hindsight's agentic reasoning
 */
export async function reflectOnMemory(bankId, query) {
  const c = getClient();
  try {
    const response = await c.reflect(bankId, query);
    
    // Sometimes the cloud API places the result in unexpected properties if it streams or hits limits
    let textOut = response?.text || response?.answer || response?.content || response?.message || response?.generated_text;

    if (textOut === undefined || textOut === null || textOut === '') {
        const tokenUsage = response?.usage;
        const wasSuppressed = tokenUsage && tokenUsage.output_tokens > 0;
        
        console.warn('[Hindsight] Empty text received. Response keys:', Object.keys(response || {}));
        console.warn('[Hindsight] Full response raw:', response);
        
        textOut = wasSuppressed 
          ? `🛡️ VIGILANT IDE — Content Generation Suppressed. The Hindsight Cloud agent successfully generated a solution (${tokenUsage.output_tokens} tokens), but the content was withheld by a safety guardrail. Please refine your code comments and try again.`
          : '🛡️ VIGILANT IDE — Hindsight Cloud API returned an empty payload. Please edit the code slightly or simplify the prompt and try again.';
    }

    return { success: true, text: textOut, response };
  } catch (err) {
    console.error('[Hindsight] Reflect error:', err);
    return { success: false, text: '', error: err.message };
  }
}

/**
 * Check if Hindsight server is reachable
 */
export async function checkConnection() {
  try {
    const headers = {};
    if (HINDSIGHT_API_KEY) {
      headers['Authorization'] = `Bearer ${HINDSIGHT_API_KEY}`;
    }
    const res = await fetch(`${HINDSIGHT_BASE_URL}/v1/default/banks`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
