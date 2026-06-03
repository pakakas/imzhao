import { readdir, readFile } from 'fs/promises';
import { join, basename } from 'path';

export interface Payload {
    name: string;
    content: string;
}

export interface Scenario {
    name: string;
    payloads: Payload[];
}

/**
 * Auto-discover scenarios from folder structure:
 *   scenarios/<scenario-name>/payloads/<format>.txt
 */
export async function discoverScenarios(scenariosDir: string): Promise<Scenario[]> {
    const scenarios: Scenario[] = [];
    const entries = await readdir(scenariosDir, { withFileTypes: true });

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const payloadsDir = join(scenariosDir, entry.name, 'payloads');

        try {
            const files = await readdir(payloadsDir);
            const payloads: Payload[] = [];

            for (const file of files) {
                if (!file.endsWith('.txt')) continue;
                const content = await readFile(join(payloadsDir, file), 'utf-8');
                const name = basename(file, '.txt');
                payloads.push({ name, content });
            }

            if (payloads.length > 0) {
                scenarios.push({ name: entry.name, payloads });
            }
        } catch {
            // No payloads folder, skip
        }
    }

    return scenarios;
}

/**
 * Load a specific scenario by name
 */
export async function loadScenario(scenariosDir: string, scenarioName: string): Promise<Scenario | null> {
    const scenarios = await discoverScenarios(scenariosDir);
    return scenarios.find(s => s.name === scenarioName) || null;
}

/**
 * List all available scenario names
 */
export async function listScenarios(scenariosDir: string): Promise<string[]> {
    const scenarios = await discoverScenarios(scenariosDir);
    return scenarios.map(s => s.name);
}
