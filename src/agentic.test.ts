import { decodeAgentic } from "./agentic";
import { test, expect } from "bun:test";
import { MARKERS } from "@pakakas/markzero";

test("decodeAgentic decodes plain text correctly", () => {
  const raw = "Мsystem@2026-07-15T00:00:00Z░text≡Hello world";
  const result = decodeAgentic(raw);
  expect(Array.isArray(result)).toBe(false);
  const msg = result as any;
  expect(msg.role).toBe("system");
  expect(msg.blocks.length).toBe(1);
  expect(msg.blocks[0]).toEqual({ type: "text", content: "Hello world" });
});

test("decodeAgentic intercepts type annotations via reviver", () => {
  // Encoded form of Map { "τstr": "my value" } -> ░→τstr≡my value
  const raw = "Мassistant@2026-07-15T00:00:00Z░→τstr≡my value";
  const result = decodeAgentic(raw);
  const msg = result as any;
  expect(msg.blocks.length).toBe(1);
  expect(msg.blocks[0]).toEqual({
    type: "type-annotation",
    annotation: "str",
    value: "my value",
  });
});

test("decodeAgentic intercepts invoke calls via reviver", () => {
  // Encoded form of Map { "invoke": "run_test" } -> ░→invoke≡run_test
  const raw = "Мassistant@2026-07-15T00:00:00Z░→invoke≡run_test";
  const result = decodeAgentic(raw);
  const msg = result as any;
  expect(msg.blocks.length).toBe(1);
  expect(msg.blocks[0]).toEqual({
    type: "invoke",
    commands: "run_test",
  });
});

test("decodeAgentic respects intercept options", () => {
  const raw = "Мassistant@2026-07-15T00:00:00Z░→τstr≡my value";
  const result = decodeAgentic(raw, { interceptTypes: false });
  const msg = result as any;
  expect(msg.blocks[0].type).toBe("data");
});

test("decodeAgentic parallel tool calls", () => {
  // Encoded form of Map { "invoke": ["Script1", "Script2", "Script3"] }
  const raw = "Мassistant@2026-07-15T00:00:00Z░→invoke≡※1░Script1→Script2→Script3";
  const result = decodeAgentic(raw);
  const msg = result as any;
  expect(msg.blocks[0].type).toBe("invoke");
  expect(msg.blocks[0].commands).toEqual(["Script1", "Script2", "Script3"]);
});

test("decodeAgentic sequential tool calls", () => {
  // Encoded form of 1D Set ["invoke", "Script1", "Script2", "Script3"] -> ░invoke→Script1→Script2→Script3
  const raw = "Мassistant@2026-07-15T00:00:00Z░invoke→Script1→Script2→Script3";
  const result = decodeAgentic(raw);
  const msg = result as any;
  expect(msg.blocks[0].type).toBe("invoke");
  expect(msg.blocks[0].commands).toEqual(["Script1", "Script2", "Script3"]);
});

test("decodeAgentic invoke with metadata", () => {
  // Encoded form of Map { "code": "ts", "invoke": "CLI_SCRIPT" } -> ░→code≡ts→invoke≡CLI_SCRIPT
  const raw = "Мassistant@2026-07-15T00:00:00Z░→code≡ts→invoke≡CLI_SCRIPT";
  const result = decodeAgentic(raw);
  const msg = result as any;
  expect(msg.blocks[0].type).toBe("invoke");
  expect(msg.blocks[0].code).toBe("ts");
  expect(msg.blocks[0].commands).toBe("CLI_SCRIPT");
});

test("decodeAgentic invoke mixed with text and data blocks", () => {
  // Encoded form of multiple grids -> ░text≡Running...░→invoke≡CLI_SCRIPT░→result≡ok
  const raw = "Мassistant@2026-07-15T00:00:00Z░text≡Running...░→invoke≡CLI_SCRIPT░→result≡ok";
  const result = decodeAgentic(raw);
  const msg = result as any;
  expect(msg.blocks.length).toBe(3);
  expect(msg.blocks[0].type).toBe("text");
  expect(msg.blocks[1].type).toBe("invoke");
  expect(msg.blocks[2].type).toBe("data");
});

test("decodeAgentic decodes flat tool invoke command (¡) directly without grid marker", () => {
  // Directly without grid marker: ¡grep "const" ...
  const raw = 'Мassistant@2026-07-15T00:00:00Z¡grep "const" --exclude-dir=node_modules -r';
  const result = decodeAgentic(raw);
  const msg = result as any;
  expect(msg.blocks.length).toBe(1);
  expect(msg.blocks[0]).toEqual({
    type: "tool-invoke",
    mode: "pipeline",
    commands: [
      ["grep", "const", "--exclude-dir=node_modules", "-r"]
    ]
  });
});

test("decodeAgentic decodes multiple tool invoke commands (pipeline with ¦)", () => {
  const raw = 'Мassistant@2026-07-15T00:00:00Z¡grep "const" --exclude-dir=node_modules ¦ count -n 10';
  const result = decodeAgentic(raw);
  const msg = result as any;
  expect(msg.blocks.length).toBe(1);
  expect(msg.blocks[0]).toEqual({
    type: "tool-invoke",
    mode: "pipeline",
    commands: [
      ["grep", "const", "--exclude-dir=node_modules"],
      ["count", "-n", "10"]
    ]
  });
});

test("decodeAgentic decodes multiple tool invoke commands (parallel with →)", () => {
  const raw = 'Мassistant@2026-07-15T00:00:00Z¡grep "const" --exclude-dir=node_modules → count -v';
  const result = decodeAgentic(raw);
  const msg = result as any;
  expect(msg.blocks.length).toBe(1);
  expect(msg.blocks[0]).toEqual({
    type: "tool-invoke",
    mode: "parallel",
    commands: [
      ["grep", "const", "--exclude-dir=node_modules"],
      ["count", "-v"]
    ]
  });
});
