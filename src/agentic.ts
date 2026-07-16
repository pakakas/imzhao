import { decodeMZ } from "@pakakas/markzero";
import type { MZMessage, MZBlock, MZTextBlock, MZDataBlock, MZInvokeBlock, Reviver } from "@pakakas/markzero";
import { MARKERS } from "@pakakas/markzero";
import { TYPE_ANNOTATION, INVOKE } from "./constants";

export type AgenticBlockType = "text" | "data" | "type-annotation" | "tool-invoke";

export interface AgenticTextBlock {
  type: "text";
  content: string;
}

export interface AgenticDataBlock {
  type: "data";
  payload: any;
  [key: string]: any;
}

export interface AgenticTypeBlock {
  type: "type-annotation";
  annotation: string;
  value: any;
}

export interface AgenticToolInvokeBlock {
  type: "tool-invoke";
  mode: "pipeline" | "parallel";
  commands: string[][];
}

export type AgenticBlock = AgenticTextBlock | AgenticDataBlock | AgenticTypeBlock | AgenticToolInvokeBlock;

export interface AgenticMessage {
  role: string;
  ts: string;
  blocks: AgenticBlock[];
}

export interface AgenticOptions {
  interceptTypes?: boolean;
  interceptInvoke?: boolean;
}

const TYPE_ANNOTATION_RE = new RegExp(`^${TYPE_ANNOTATION}(\\w+)$`);

function hasTypeAnnotation(obj: any): boolean {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return false;
  for (const key of Object.keys(obj)) {
    if (TYPE_ANNOTATION_RE.test(key)) return true;
  }
  return false;
}

function extractTypeAnnotation(obj: any): { annotation: string; value: any } | null {
  for (const key of Object.keys(obj)) {
    const match = key.match(TYPE_ANNOTATION_RE);
    if (match) {
      return { annotation: match[1], value: obj[key] };
    }
  }
  return null;
}

function splitEscaped(str: string, sep: string): string[] {
  const result: string[] = [];
  let current = "";
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "\\" && str[i + 1] === sep) {
      current += sep;
      i++;
    } else if (str.substring(i, i + sep.length) === sep) {
      result.push(current);
      current = "";
      i += sep.length - 1;
    } else {
      current += str[i];
    }
  }
  result.push(current);
  return result;
}

function parseArgs(argsStr: string): string[] {
  const args: string[] = [];
  const regex = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|([^\s]+)/g;
  let match;
  while ((match = regex.exec(argsStr)) !== null) {
    if (match[1] !== undefined) {
      args.push(match[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\')); // unescape double quotes
    } else if (match[2] !== undefined) {
      args.push(match[2].replace(/\\'/g, "'").replace(/\\\\/g, '\\')); // unescape single quotes
    } else if (match[3] !== undefined) {
      args.push(match[3]);
    }
  }
  return args;
}

/**
 * Reviver function for intercepting agentic markers (τ and invoke) during decode.
 */
export const agenticReviver: Reviver = (value: any, key: string | number, parent: any): any => {
  // 1. Tangani Tool Invoke Marker (¡) di tingkat value string
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith(INVOKE)) {
      const rest = trimmed.slice(INVOKE.length).trim();
      
      let mode: "pipeline" | "parallel" = "pipeline";
      let segments: string[] = [];
      
      if (rest.includes(MARKERS.ROW_MARKER)) {
        mode = "parallel";
        segments = splitEscaped(rest, MARKERS.ROW_MARKER);
      } else if (rest.includes(MARKERS.ROW_SEP)) {
        mode = "pipeline";
        segments = splitEscaped(rest, MARKERS.ROW_SEP);
      } else {
        segments = [rest];
      }
      
      const commands = segments.map(seg => parseArgs(seg.trim()));
      return {
        type: "tool-invoke",
        mode,
        commands
      };
    }
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  // 2. Tangani Type Annotation (τ)
  const typeKey = Object.keys(value).find(k => k.startsWith(TYPE_ANNOTATION));
  if (typeKey) {
    const annotation = typeKey.slice(TYPE_ANNOTATION.length);
    return {
      type: "type-annotation",
      annotation: annotation,
      value: value[typeKey]
    };
  }

  return value;
};

function classifyBlock(block: MZBlock, options: AgenticOptions): AgenticBlock {
  if (block.type === "text") {
    const content = block.content;
    if (content && typeof content === "object" && (content as any).type === "tool-invoke") {
      return content as AgenticBlock;
    }
    return { type: "text", content: block.content };
  }

  if (block.type === "data") {
    let payload = block.payload;
    if (Array.isArray(payload) && payload.length === 1) {
      payload = payload[0];
    }

    if (payload && typeof payload === "object") {
      if (options.interceptTypes !== false && payload.type === "type-annotation") {
        return payload;
      }
      if (options.interceptInvoke !== false && payload.type === "tool-invoke") {
        return payload;
      }
    }
    // Fallback: check raw object (in case reviver didn't run)
    if (options.interceptTypes !== false && hasTypeAnnotation(block.payload)) {
      const extracted = extractTypeAnnotation(block.payload);
      if (extracted) {
        return { type: "type-annotation", ...extracted };
      }
    }
    const { type: _, ...rest } = block;
    return { type: "data", ...rest };
  }

  return { type: "data", payload: block };
}

export function decodeAgentic(raw: string, options?: AgenticOptions): AgenticMessage | AgenticMessage[] {
  if (!raw) throw new Error("Input string is required");

  const hasEnvelope = raw.startsWith(MARKERS.MESSAGE_START);
  const parsedInput = hasEnvelope ? raw : `${MARKERS.MESSAGE_START}assistant@2026-07-16T00:00:00Z${raw}`;

  // Pass context containing reviver to decodeMZ
  const result = decodeMZ(parsedInput, { reviver: agenticReviver });

  if (Array.isArray(result)) {
    return result.map(msg => ({
      role: hasEnvelope ? msg.role : "",
      ts: hasEnvelope ? msg.ts : "",
      blocks: msg.blocks.map(b => classifyBlock(b, options || {}))
    }));
  }

  return {
    role: hasEnvelope ? result.role : "",
    ts: hasEnvelope ? result.ts : "",
    blocks: result.blocks.map(b => classifyBlock(b, options || {}))
  };
}
