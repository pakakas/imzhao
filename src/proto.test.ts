import { parse, encodeResult } from "./proto.ts";
import { encode, MARKERS } from "@pakakas/markzero";
import { test, expect } from "bun:test";

const M = MARKERS.MESSAGE_START;

// parse() delegates to decodeAgentic — always receives MZ stream

test("parse single MZ message returns AgenticMessage", () => {
  const payload = encode({ foo: "bar" });
  const stream = `${M}assistant@2026-01-01T00:00:00Z\n${payload}`;
  const result = parse(stream);
  // single message → AgenticMessage (not array)
  expect(Array.isArray(result)).toBe(false);
  expect((result as any).role).toBe("assistant");
});

test("parse multiple MZ messages returns AgenticMessage[]", () => {
  const p1 = encode({ foo: "bar" });
  const p2 = encode({ baz: "qux" });
  const stream = `${M}assistant@2026-01-01T00:00:00Z\n${p1}${M}assistant@2026-01-01T00:00:01Z\n${p2}`;
  const result = parse(stream);
  expect(Array.isArray(result)).toBe(true);
  expect((result as any[]).length).toBe(2);
});

test("parse MZ with flat invoke (¡) returns tool-invoke block", () => {
  const stream = `${M}assistant@2026-01-01T00:00:00Z\n¡grep pattern path`;
  const result = parse(stream) as any;
  const blocks = result.blocks;
  expect(blocks[0].type).toBe("tool-invoke");
  expect(blocks[0].commands[0]).toEqual(["grep", "pattern", "path"]);
});

// encodeResult tests unchanged

test("encodeResult wraps primitive values in object with value key and adds header", () => {
  const result = encodeResult("hello world");
  expect(result.startsWith(MARKERS.MESSAGE_START)).toBe(true);
  expect(result.includes("MZrules")).toBe(true);
});

test("encodeResult wraps empty array in object with result key", () => {
  const result = encodeResult([]);
  expect(result.startsWith(MARKERS.MESSAGE_START)).toBe(true);
  expect(result.includes("MZrules")).toBe(true);
});

test("encodeResult wraps empty object in object with result key", () => {
  const result = encodeResult({});
  expect(result.startsWith(MARKERS.MESSAGE_START)).toBe(true);
  expect(result.includes("MZrules")).toBe(true);
});

test("encodeResult attaches title symbol when title provided", () => {
  const result = encodeResult({ foo: "bar" }, "Test Title");
  expect(result.startsWith(MARKERS.MESSAGE_START)).toBe(true);
  expect(result.includes("MZrules")).toBe(true);
});
