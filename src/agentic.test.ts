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

test("decodeAgentic respects intercept options", () => {
  const raw = "Мassistant@2026-07-15T00:00:00Z░→τstr≡my value";
  const result = decodeAgentic(raw, { interceptTypes: false });
  const msg = result as any;
  expect(msg.blocks[0].type).toBe("data");
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
  const raw = 'Мassistant@2026-07-15T00:00:00Z¡grep "const" --exclude-dir=node_modules¦count -n 10';
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
  const raw = 'Мassistant@2026-07-15T00:00:00Z¡grep "const" --exclude-dir=node_modules→count -v';
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

test("decodeAgentic decodes plain flat command without М envelope", () => {
  const raw = '¡grep "const"';
  const result = decodeAgentic(raw);
  const msg = result as any;
  expect(msg.role).toBe("");
  expect(msg.ts).toBe("");
  expect(msg.blocks.length).toBe(1);
  expect(msg.blocks[0]).toEqual({
    type: "tool-invoke",
    mode: "pipeline",
    commands: [["grep", "const"]]
  });
});

test("decodeAgentic decodes plain ADN grid without М envelope", () => {
  const raw = '░Grep Matches§file¦line→src/main.ts¦10';
  const result = decodeAgentic(raw);
  const msg = result as any;
  expect(msg.role).toBe("");
  expect(msg.ts).toBe("");
  expect(msg.blocks.length).toBe(1);
  expect(msg.blocks[0].type).toBe("data");
});
