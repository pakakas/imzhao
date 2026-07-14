/**
 * Shared LLM utilities for benchmark providers.
 * Each provider imports this and overrides baseUrl/apikey/model.
 */

export interface LlmConfig {
  baseUrl: string;
  apikey: string;
  model: string;
  sysprompt?: string;
}

export const cleanEnvValue = (val: string): string =>
  val.replace(/\s*#.*$/, '').trim();

export const makePayload = (content: string, config: LlmConfig): any => ({
  model: config.model,
  temperature: 0,
  messages: [
    { role: "system", content: config.sysprompt || 'Respond with only: ok' },
    { role: "user", content },
  ],
});

export const callLlm = async (payload: any, config: LlmConfig): Promise<any | null> => {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apikey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const d = await response.json() as any;
  if (d.error || d.type === "error") {
    const msg = d.error?.message || d.error?.type || JSON.stringify(d.error);
    console.log(`  ❌ [${response.status}] ${msg}`);
    return null;
  }
  return d;
};

export const getTokenUsage = (data: any) => ({
  prompt: data?.usage?.prompt_tokens ?? 0,
  completion: data?.usage?.completion_tokens ?? 0,
  total: data?.usage?.total_tokens ?? 0,
});
