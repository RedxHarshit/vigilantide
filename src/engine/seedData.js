import { incidents } from '../data/incidents';
import { architectureMap } from '../data/archMap';
import { retainMemory, BANKS } from './hindsight';

/**
 * Seeds the Hindsight memory banks with incident and architecture data.
 * Returns progress updates via the onProgress callback.
 */
export async function seedMemoryBanks(onProgress) {
  const total = incidents.length + architectureMap.length;
  let completed = 0;

  onProgress?.({ phase: 'start', total, completed, message: 'Starting memory seed...' });

  // Seed incident_memory bank
  for (const incident of incidents) {
    const content = [
      `Incident ${incident.id}: ${incident.title}`,
      `Severity: ${incident.severity}`,
      `Root Cause: ${incident.root_cause}`,
      `Affected Files: ${incident.affected_files.join(', ')}`,
      `Impact: ${incident.impact}`,
      `Resolution:\n${incident.resolution_code}`,
    ].join('\n\n');

    const result = await retainMemory(BANKS.INCIDENTS, content, {
      context: 'production incident post-mortem',
      timestamp: incident.date,
      documentId: incident.id,
    });

    completed++;
    onProgress?.({
      phase: 'incidents',
      total,
      completed,
      message: result.success
        ? `Retained ${incident.id}: ${incident.title}`
        : `Failed ${incident.id}: ${result.error}`,
      success: result.success,
    });
  }

  // Seed architecture_map bank
  for (const entry of architectureMap) {
    const content = [
      `File: ${entry.file_path}`,
      `Dependencies: ${entry.depends_on.join(', ')}`,
      `PCI Compliance Risk: ${entry.pci_compliance_risk}`,
      `Business Criticality: ${entry.business_criticality}`,
      `Description: ${entry.description}`,
    ].join('\n');

    const result = await retainMemory(BANKS.ARCHITECTURE, content, {
      context: 'architecture dependency map',
      documentId: `arch-${entry.file_path}`,
    });

    completed++;
    onProgress?.({
      phase: 'architecture',
      total,
      completed,
      message: result.success
        ? `Retained arch: ${entry.file_path}`
        : `Failed arch: ${result.error}`,
      success: result.success,
    });
  }

  onProgress?.({ phase: 'complete', total, completed, message: 'Memory seeding complete!' });
}
