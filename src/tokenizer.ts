/**
 * Utility to get token count from OpenAI's tokenizer endpoint.
 * Reads the API key from the environment variable `OPENAI_API_KEY`.
 * Uses the global `fetch` (available in Bun/Node >=18). If the key is missing
 * the function throws an informative error.
 */
export async function getOpenAITokenCount(
  input: string,
  model: string = "gpt-4"
): Promise<number> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY not set in environment – cannot call OpenAI tokenizer."
    );
  }

  const response = await fetch("https://api.openai.com/v1/tokens", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, input }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `OpenAI token API error ${response.status}: ${response.statusText}\n${errText}`
    );
  }

  const data = await response.json();
  // Expected shape: { token_count: number, ... }
  if (typeof data.token_count !== "number") {
    throw new Error(
      `Unexpected response format from OpenAI token API: ${JSON.stringify(
        data
      )}`
    );
  }
  return data.token_count;
}
