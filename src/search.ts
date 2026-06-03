import { promises as fs } from "node:fs";
import { join, relative } from "node:path";

export interface SearchMatch {
  file: string;
  lineNumber: number;
  lineContent: string;
}

export interface SearchOptions {
  ignoreDirs?: string[];
  maxResults?: number;
}

/**
 * Recursively searches for matches of a text or regex pattern in a directory.
 * Automatically ignores binary files and common system folders (.git, node_modules) by default.
 */
export async function grepSearch(
  dirPath: string,
  query: string | RegExp,
  options: SearchOptions = {}
): Promise<SearchMatch[]> {
  const {
    ignoreDirs = [".git", "node_modules", "dist", "build"],
    maxResults = 100,
  } = options;

  const results: SearchMatch[] = [];
  const regex = typeof query === "string" ? new RegExp(query, "i") : query;

  async function scan(currentDir: string) {
    if (results.length >= maxResults) return;

    let entries;
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      return; // Skip folders we can't read
    }

    for (const entry of entries) {
      if (results.length >= maxResults) break;

      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (ignoreDirs.includes(entry.name)) continue;
        await scan(fullPath);
      } else if (entry.isFile()) {
        // Skip common binary files
        if (/\.(png|jpe?g|gif|ico|webp|zip|gz|tar|pdf|exe|dll|so|dylib|woff2?|eot|ttf|mp[34]|wav)$/i.test(entry.name)) {
          continue;
        }

        try {
          const content = await fs.readFile(fullPath, "utf-8");
          // Quick pre-check
          if (!regex.test(content)) continue;

          const lines = content.split(/\r?\n/);
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (regex.test(line)) {
              results.push({
                file: relative(dirPath, fullPath).replace(/\\/g, "/"),
                lineNumber: i + 1,
                lineContent: line.trim(),
              });
              if (results.length >= maxResults) break;
            }
          }
        } catch {
          // Ignore files we fail to read (e.g. permission issues or actual binary files we missed)
        }
      }
    }
  }

  await scan(dirPath);
  return results;
}
