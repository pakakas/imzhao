import { decode, encode } from "@pakakas/markzero";
import { PROTO_START, PROTO_END } from "./constants.ts";
import { addInlineDecoder } from "./mz-header.ts";


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
    const startIndex = source.indexOf(PROTO_START, cursor);
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
    // Locate closing marker
    const closeIndex = source.indexOf(PROTO_END, startIndex + PROTO_START.length);
    let rawPayload = "";
    let nextCursor = 0;
    if (closeIndex !== -1) {
      rawPayload = source.slice(startIndex + PROTO_START.length, closeIndex);
      nextCursor = closeIndex + PROTO_END.length;
    } else {
      rawPayload = source.slice(startIndex + PROTO_START.length);
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
 * adds inline decoder header, and surrounds the output with iMZHAO protocol markers (PROTO_START).
 */
export function encodeResult(result: any, title?: string, addCloseMarker: boolean = false): string {
  let payload: any = result;

  // MarkZero encoding requires non-empty object or array.
  if (typeof result !== "object" || result === null) {
    payload = { value: result };
  } else if (Array.isArray(result) && result.length === 0) {
    payload = { result: [] };
  } else if (!Array.isArray(result) && Object.keys(result).length === 0) {
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
  let resultStr = PROTO_START + mz;
  if (addCloseMarker) {
    resultStr += PROTO_END;
  }
  
  return resultStr;
}
