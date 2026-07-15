import { decode, encode, MARKERS } from "@pakakas/markzero";
import { addInlineDecoder } from "./mz-header.ts";
import { TYPE_ANNOTATION, INVOKE } from "./constants.ts";


export interface ParsedBlock {
  type: "text" | "mz";
  content: string;
  data?: any[];
}

/**
 * Parses a mixed text output from AI into segments of plain text and decoded MarkZero blocks.
 * Preserves the original text, and loops to decode multiple MZ blocks if they exist.
 */
export function parse(source: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  if (!source) return blocks;

  let cursor = 0;
  // Find next start marker using indexOf (handles any literal marker string)
  // The second parsing loop using regex is deprecated and removed.
  while (cursor < source.length) {
    const startIndex = source.indexOf(MARKERS.MESSAGE_START, cursor);
    if (startIndex === -1) {
      // No more markers, push remaining text
      const remaining = source.slice(cursor);
      if (remaining) blocks.push({ type: "text", content: remaining });
      break;
    }
    // Push preceding text as a block
    if (startIndex > cursor) {
      blocks.push({ type: "text", content: source.slice(cursor, startIndex) });
    }
    // Locate next start marker to determine the end of this block
    const nextStart = source.indexOf(MARKERS.MESSAGE_START, startIndex + MARKERS.MESSAGE_START.length);
    let rawPayload = "";
    let nextCursor = 0;
    if (nextStart !== -1) {
      rawPayload = source.slice(startIndex + MARKERS.MESSAGE_START.length, nextStart);
      nextCursor = nextStart;
    } else {
      rawPayload = source.slice(startIndex + MARKERS.MESSAGE_START.length);
      nextCursor = source.length;
    }
    const decodePayload = rawPayload;
    let decodedData: any[] | undefined = undefined;
    try { decodedData = decode(decodePayload); } catch (e) {}
    blocks.push({ type: "mz", content: rawPayload, data: decodedData });
    cursor = nextCursor;
  }

  return blocks;
}

/**
 * Encodes a response or data payload back into a valid iMZHAO/MarkZero payload.
 * Automatically wraps primitive results in structured objects to conform to MarkZero requirements,
 * adds inline decoder header, and surrounds the output with iMZHAO protocol markers (MARKERS.MESSAGE_START).
 */
function formatArgs(args: string[]): string {
  return args.map(arg => {
    if (/\s/.test(arg)) {
      return `"${arg.replace(/"/g, '\\"')}"`;
    }
    return arg;
  }).join(" ");
}

function prepareAgenticPayload(val: any): any {
  if (val === null || typeof val !== "object") {
    return val;
  }

  if (Array.isArray(val)) {
    return val.map(prepareAgenticPayload);
  }

  if (typeof val.type === "string") {
    if (val.type === "tool-invoke" && Array.isArray(val.commands)) {
      const formattedCmds = val.commands.map((cmd: any) => formatArgs(cmd));
      const separator = val.mode === "parallel" ? MARKERS.ROW_MARKER : MARKERS.ROW_SEP;
      return [`${INVOKE}${formattedCmds.join(separator)}`];
    }
    if (val.type === "invoke" && val.commands !== undefined) {
      const { type, commands, ...rest } = val;
      const preparedRest = prepareAgenticPayload(rest);
      return {
        invoke: prepareAgenticPayload(commands),
        ...preparedRest
      };
    }
    if (val.type === "type-annotation" && typeof val.annotation === "string") {
      const key = `${TYPE_ANNOTATION}${val.annotation}`;
      return { [key]: prepareAgenticPayload(val.value) };
    }
  }

  const result: any = {};
  for (const [k, v] of Object.entries(val)) {
    result[k] = prepareAgenticPayload(v);
  }
  return result;
}

/**
 * Encodes a response or data payload back into a valid iMZHAO/MarkZero payload.
 * Automatically wraps primitive results in structured objects to conform to MarkZero requirements,
 * adds inline decoder header, and surrounds the output with iMZHAO protocol markers (MARKERS.MESSAGE_START).
 */
export function encodeResult(result: any, title?: string): string {
  if (result && typeof result === "object" && result.type === "tool-invoke" && Array.isArray(result.commands)) {
    const formattedCmds = result.commands.map((cmd: any) => formatArgs(cmd));
    const separator = result.mode === "parallel" ? MARKERS.ROW_MARKER : MARKERS.ROW_SEP;
    return MARKERS.MESSAGE_START + `${INVOKE}${formattedCmds.join(separator)}`;
  }

  let payload: any = prepareAgenticPayload(result);

  // MarkZero encoding requires non-empty object or array.
  if (typeof payload !== "object" || payload === null) {
    payload = { value: payload };
  } else if (Array.isArray(payload) && payload.length === 0) {
    payload = { result: [] };
  } else if (!Array.isArray(payload) && Object.keys(payload).length === 0) {
    payload = { result: {} };
  }

  if (title && typeof payload === "object" && payload !== null) {
    // Attach Title symbol
    payload[Symbol.for("title")] = title;
  }

  // Encode the payload using MarkZero
  let mz = encode(payload);
  
  // Add inline decoder header
  mz = addInlineDecoder(mz);
  
  // Wrap with iMZHAO markers
  let resultStr = MARKERS.MESSAGE_START + mz;
  
  return resultStr;
}
