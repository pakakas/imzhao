import { promises as fs } from "node:fs";
import { dirname } from "node:path";
import { cat } from "@pakakas/cat";

/**
 * Reads a file and returns its content.
 * Supports reading a specific range of lines (1-indexed, inclusive) to optimize token usage.
 */
export async function readFile(
  filePath: string,
  options?: { startLine?: number; endLine?: number }
): Promise<string> {
  return cat(filePath, options);
}

/**
 * Writes content to a file. Automatically creates parent directories if they don't exist.
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.mkdir(dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf-8");
}

/**
 * Patches a file by replacing a contiguous target block of text with a replacement block.
 * Returns true if the patch was successfully applied, false otherwise.
 */
export async function patchFile(
  filePath: string,
  search: string,
  replacement: string
): Promise<boolean> {
  const content = await fs.readFile(filePath, "utf-8");
  if (!content.includes(search)) {
    return false;
  }
  const updatedContent = content.replace(search, replacement);
  await fs.writeFile(filePath, updatedContent, "utf-8");
  return true;
}
