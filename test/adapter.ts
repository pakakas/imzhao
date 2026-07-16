import { spawnSync } from "child_process";
import * as nativeAgentic from "../src/agentic";
import * as nativeHeader from "../src/mz-header";
import * as nativeRegistry from "../src/tool-registry";
import * as nativeProto from "../src/proto";

const TEST_IMPL_CMD = process.env.TEST_IMPL_CMD;

function runExternal(action: string, args: any): any {
  if (!TEST_IMPL_CMD) {
    throw new Error("TEST_IMPL_CMD is not set");
  }

  const parts = TEST_IMPL_CMD.trim().split(/\s+/);
  const cmd = parts[0]!;
  const cmdArgs = [...parts.slice(1), action];

  const result = spawnSync(cmd, cmdArgs, {
    input: JSON.stringify(args),
    encoding: "utf-8",
  });

  if (result.status !== 0) {
    throw new Error(`External test impl failed (exit code ${result.status}): ${result.stderr || result.error}`);
  }

  try {
    const parsed = JSON.parse(result.stdout.trim());
    if (parsed.error) {
      throw new Error(parsed.error);
    }
    return parsed.result;
  } catch (err: any) {
    throw new Error(`Failed to parse external response: ${result.stdout}. Error: ${err.message}`);
  }
}

export function decodeAgentic(raw: string, options?: any) {
  if (TEST_IMPL_CMD) {
    return runExternal("decodeAgentic", { raw, options });
  }
  return nativeAgentic.decodeAgentic(raw, options);
}

export function addInlineDecoder(mzBlock: string, mode?: number) {
  if (TEST_IMPL_CMD) {
    return runExternal("addInlineDecoder", { mzBlock, mode });
  }
  return nativeHeader.addInlineDecoder(mzBlock, mode);
}

export function buildHeader(adn: string) {
  if (TEST_IMPL_CMD) {
    return runExternal("buildHeader", { adn });
  }
  return nativeHeader.buildHeader(adn);
}

export function buildToolCallPayload(errorPayload: any) {
  if (TEST_IMPL_CMD) {
    return runExternal("buildToolCallPayload", { errorPayload });
  }
  return nativeRegistry.buildToolCallPayload(errorPayload);
}

export function encodeResult(result: any, title?: string) {
  if (TEST_IMPL_CMD) {
    return runExternal("encodeResult", { result, title });
  }
  return nativeProto.encodeResult(result, title);
}

export function parse(source: string) {
  if (TEST_IMPL_CMD) {
    return runExternal("parse", { source });
  }
  return nativeProto.parse(source);
}

export function getAvailableTools(errorPayload: any) {
  if (TEST_IMPL_CMD) {
    return runExternal("getAvailableTools", { errorPayload });
  }
  return nativeRegistry.getAvailableTools(errorPayload);
}

export function toRegistryGrid(tools: any) {
  if (TEST_IMPL_CMD) {
    return runExternal("toRegistryGrid", { tools });
  }
  return nativeRegistry.toRegistryGrid(tools);
}
