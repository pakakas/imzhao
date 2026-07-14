import { decodeMZ } from "@pakakas/markzero";
import type { MZMessage, MZBlock, MZTextBlock, MZDataBlock, MZInvokeBlock } from "@pakakas/markzero";
import { MARKERS } from "@pakakas/markzero/src/util";

export type AgenticBlockType = "text" | "data" | "invoke" | "type-annotation" | "tool-invoke";

export interface AgenticTextBlock {
  type: "text";
  content: string;
}

export interface AgenticDataBlock {
  type: "data";
  payload: any;
  [key: string]: any;
}

export interface AgenticInvokeBlock {
  type: "invoke";
  commands: string | string[];
  [key: string]: any;
}

export interface AgenticTypeBlock {
  type: "type-annotation";
  annotation: string;
  value: any;
}

export type AgenticBlock = AgenticTextBlock | AgenticDataBlock | AgenticInvokeBlock | AgenticTypeBlock;

export interface AgenticMessage {
  role: string;
  ts: string;
  blocks: AgenticBlock[];
}

export interface AgenticOptions {
  interceptTypes?: boolean;
  interceptInvoke?: boolean;
}

const TYPE_ANNOTATION_RE = new RegExp(`^${MARKERS.TYPE_ANNOTATION}(\\w+)$`);

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

function classifyBlock(block: MZBlock, options: AgenticOptions): AgenticBlock {
  if (block.type === "text") {
    return { type: "text", content: block.content };
  }

  if (block.type === "invoke") {
    if (options.interceptInvoke !== false) {
      return { type: "invoke", commands: block.commands, ...block };
    }
    return { type: "data", payload: block };
  }

  if (block.type === "data") {
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
  const result = decodeMZ(raw);

  if (Array.isArray(result)) {
    return result.map(msg => ({
      ...msg,
      blocks: msg.blocks.map(b => classifyBlock(b, options ?? {})),
    }));
  }

  return {
    ...result,
    blocks: result.blocks.map(b => classifyBlock(b, options ?? {})),
  };
}
