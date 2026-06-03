import { GPTTokens } from "gpt-tokens";
import { countTokens as countClaudeTokens } from "@anthropic-ai/tokenizer";
import llama3Tokenizer from "llama3-tokenizer-js";

export type Provider = "gpt-4o" | "claude" | "llama3";

export function countTokens(text: string, provider: Provider): number {
  if (provider === "gpt-4o") {
    const usage = new GPTTokens({
      model: "gpt-4o",
      messages: [{ role: "user", content: text }]
    });
    return usage.usedTokens - 7; // Baseline overhead
  } 
  
  if (provider === "claude") {
    return countClaudeTokens(text);
  }

  if (provider === "llama3") {
    return llama3Tokenizer.encode(text).length;
  }

  throw new Error(`Unknown provider: ${provider}`);
}
