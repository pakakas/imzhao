import { encode, ENC_VALUES, MARKERS } from "@pakakas/markzero";
import { TYPE_ANNOTATION, INVOKE } from "./constants";

/**
 * Known HITL tool names.
 */
export enum HITLActions {
  ASK_PERMISSION = 0,
  CONFIRM_ACTION = 1,
  REVIEW_DIFF = 2,
}

export enum HITLGates {
  AUTO = 0,        // auto-execute, no HITL
  CONFIRM = 1,     // show tool call, wait for approve/reject
  EDITABLE = 2,    // show tool call, allow edit before execute
  BLOCK = 3,       // always block, require explicit override
}

/**
 * Extracts HITL tools from a tool list — tools that return τask.
 * Runtime uses this to build HITL gate; AI just sees them as normal tools.
 */
export const RETURN_GRID = `${TYPE_ANNOTATION}grid`;

export interface ToolParam {
  name: string;
  type: string;
  optional?: boolean;
}

export interface ToolDef {
  name: string;
  params: ToolParam[];
  returns?: string;
}

/**
 * Extracts available tools from a zerolang error payload (JSON format).
 * Supports both structured JSON and flat MDKV-style error data.
 */
export function getAvailableTools(errorPayload: any): ToolDef[] {
  if (!errorPayload) return [];

  // JSON format: { available_tools: [{ name, params }] }
  if (Array.isArray(errorPayload.available_tools)) {
    return errorPayload.available_tools.map((tool: any) => ({
      name: tool.name,
      params: parseParams(tool.params),
      returns: tool.returns || `${TYPE_ANNOTATION}grid`,
    }));
  }

  // Flat format: { tools: "add_import,apply_code_action,search_docs", ... }
  if (typeof errorPayload.tools === "string") {
    const names = errorPayload.tools.split(",").map((s: string) => s.trim());
    return names.map((name) => {
      const paramsKey = `${name}.params`;
      const rawParams = errorPayload[paramsKey] || "";
      return {
        name,
        params: parseFlatParams(rawParams),
        returns: `${TYPE_ANNOTATION}grid`,
      };
    });
  }

  return [];
}

function parseParams(params: Record<string, string> | undefined): ToolParam[] {
  if (!params) return [];
  return Object.entries(params).map(([name, type]) => ({
    name,
    type: normalizeType(type),
    optional: type.includes("optional"),
  }));
}

function parseFlatParams(raw: string): ToolParam[] {
  if (!raw) return [];
  return raw.split(",").map((s) => {
    const trimmed = s.trim();
    const isOptional = trimmed.endsWith("[]");
    const name = trimmed.replace(/\[\]$/, "");
    return { name, type: `${TYPE_ANNOTATION}str`, optional: isOptional };
  });
}

function normalizeType(type: string): string {
  const t = type.toLowerCase().replace(/\[\]$/, "").replace(/optional/i, "").trim();
  switch (t) {
    case "string": return `${TYPE_ANNOTATION}str`;
    case "number": return `${TYPE_ANNOTATION}num`;
    case "boolean": return `${TYPE_ANNOTATION}bool`;
    default: return `${TYPE_ANNOTATION}${t}`;
  }
}

/**
 * Converts tool definitions to MZ Registry grid string.
 * Returns the ★ Registry block in pretty MZ format.
 */
export function toRegistryGrid(tools: ToolDef[]): string {
  if (tools.length === 0) return "";

  const header = `${MARKERS.GRID_MARKER} ${MARKERS.COL_MARKER} cmd${MARKERS.ROW_SEP} args${MARKERS.ROW_SEP} returns`;
  const rows = tools.map((tool) => {
    const args = tool.params.map((p) => {
      const suffix = p.optional ? " optional" : "";
      return `${p.name} ${p.type}${suffix}`;
    }).join(" ");
    return `   ${MARKERS.ROW_MARKER} ${tool.name}${MARKERS.ROW_SEP} ${args}${MARKERS.ROW_SEP} ${tool.returns || `${TYPE_ANNOTATION}grid`}`;
  });

  return `\n${MARKERS.TITLE_MARKER} Registry\n${header}\n${rows.join("\n")}`;
}

/**
 * Generates header instruction based on tool count.
 * Single tool: "Respond with ¡tool arg1 arg2"
 * Multiple tools: "Respond with ¡COMMAND ARG1 ARG2 ARG3"
 */
export function toHeaderInstruction(tools: ToolDef[]): string {
  if (tools.length === 0) return "";
  if (tools.length === 1) {
    const tool = tools[0]!;
    const args = tool.params.map((p) => p.name).join(" ");
    return `Respond with \`${INVOKE}${tool.name} ${args}\``;
  }
  return `Choose your tool and respond with \`${INVOKE}COMMAND ARG1 ARG2 ARG3\``;
}

/**
 * Marker definitions for dynamic header generation.
 */
const ADN_MARKERS: [string, string][] = [
  [MARKERS.GRID_MARKER, "grid marker"],
  [MARKERS.ROW_MARKER, "row marker"],
  [MARKERS.COL_MARKER, "column marker"],
  [MARKERS.ROW_SEP, "delimiter"],
  [MARKERS.KV_RELATION, "key-value relation"],
  [MARKERS.GRID_REF, "grid reference"],
  [MARKERS.TITLE_MARKER, "title marker"],
  [MARKERS.VALUE_MARKER, "interned string"],
  [MARKERS.VALUE_REF, "string reference"],
];

const AIR_MARKERS: [string, string][] = [
  [TYPE_ANNOTATION, "type annotation"],
  [INVOKE, "invoke tool call"],
];

/**
 * Builds a smart English header based on which markers actually appear in the ADN payload.
 * Only includes marker explanations that are present in the data.
 */
/**
 * Builds a smart English header based on which markers actually appear in the ADN payload.
 * Works for ANY ADN payload, not just tool-call scenarios.
 * Only includes marker explanations that are present in the data.
 */
export function buildHeader(adn: string): string {
  const lines: string[] = [];

  const usedAdn = ADN_MARKERS.filter(([char]) => adn.includes(char));
  const usedAir = AIR_MARKERS.filter(([char]) => adn.includes(char));

  const allUsed = [...usedAdn, ...usedAir];
  if (allUsed.length > 0) {
    lines.push("Agent Data Intermediate Representation");
    for (const [char, desc] of allUsed) {
      lines.push(`${char} ${desc}`);
    }
  }

  return lines.join("\n");
}

/**
 * Full pipeline: error payload → English header + instruction + ADN-encoded Registry + Error.
 * Uses MarkZero encoder with interning (ENC_VALUES) for the data blocks.
 */
export function buildToolCallPayload(errorPayload: any): string {
  const tools = getAvailableTools(errorPayload);
  const header = toHeaderInstruction(tools);

  // Build structured data object for ADN encoding
  const data: any[] = [];

  // Registry grid
  if (tools.length > 0) {
    const registryGrid = tools.map((tool) => ({
      cmd: tool.name,
      args: tool.params.map((p) => `${p.name} ${p.type}${p.optional ? " optional" : ""}`).join(" "),
      returns: tool.returns || `${TYPE_ANNOTATION}grid`,
    }));
    (registryGrid as any)[Symbol.for("title")] = "Registry";
    data.push(registryGrid);
  }

  // Error grid
  const error = errorPayload.error || {};
  if (error.code || error.message) {
    const errorMap: any = {};
    if (error.code) errorMap.code = error.code;
    if (error.message) errorMap.message = error.message;
    const loc = error.location || {};
    if (loc.file) errorMap.file = loc.file;
    if (loc.line) errorMap.line = String(loc.line);
    if (loc.column) errorMap.col = String(loc.column);
    errorMap[Symbol.for("title")] = "Error";
    data.push(errorMap);
  }

  // Context grid
  const ctx = errorPayload.context || {};
  if (ctx.file || ctx.language || ctx.project) {
    const ctxMap: any = {};
    if (ctx.file) ctxMap.file = ctx.file;
    if (ctx.language) ctxMap.language = ctx.language;
    if (ctx.project) ctxMap.project = ctx.project;
    ctxMap[Symbol.for("title")] = "Context";
    data.push(ctxMap);
  }

  // Encode with interning
  const adn = encode(data, ENC_VALUES);

  // Build smart header based on actual payload content
  const smartHeader = buildHeader(adn);

  return `${smartHeader}\n${header}${adn}`;
}
