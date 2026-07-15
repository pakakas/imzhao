import { encode, MARKERS } from "@pakakas/markzero";
import { addInlineDecoder } from "./mz-header.ts";
import { TYPE_ANNOTATION, INVOKE } from "./constants.ts";
import { decodeAgentic } from "./agentic.ts";
import type { AgenticMessage } from "./agentic.ts";

/**
 * Parses an MZ stream from the AI into decoded agentic messages.
 * imzhao always receives MZ stream — delegates directly to decodeAgentic.
 */
export function parse(source: string): AgenticMessage | AgenticMessage[] {
  return decodeAgentic(source);
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
    payload[Symbol.for("title")] = title;
  }

  let mz = encode(payload);
  mz = addInlineDecoder(mz);
  return MARKERS.MESSAGE_START + mz;
}
