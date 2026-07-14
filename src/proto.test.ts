// Bun test for imzhao proto parsing
import { parse, encodeResult } from "./proto.ts";
import { PROTO_START, PROTO_END } from "./constants.ts";
import { encode, decode } from "@pakakas/markzero";
import { test, expect } from "bun:test";

// Test plain text without any markers
test("parse plain text returns single text block", () => {
  const anyText = "just any text";
  const result = parse(anyText);
  expect(result).toEqual([{ type: "text", content: anyText }]);
});

// Test mixed text with one MZ block
test("parse mixed text with one MZ block", () => {
  const payload = encode({ foo: "bar" });
  const mixed = `prefix ${PROTO_START}${payload}${PROTO_END} suffix`;
  const result = parse(mixed);
  // Expect three blocks: prefix text, mz block, suffix text
  expect(result.length).toBe(3);
  expect(result[0]).toEqual({ type: "text", content: "prefix " });
  const expectedDecoded = decode(payload);
  const expectedMzBlock = { type: "mz", content: payload, data: expectedDecoded };
  expect(result[1]).toEqual(expectedMzBlock);
  expect(result[2]).toEqual({ type: "text", content: " suffix" });
});

// Test optional closure (without PROTO_END at EOF)
test("parse MZ block without close marker uses EOF as implicit close", () => {
  const payload = encode({ user: "hyuze", role: "admin" });
  const input = `Here is the user profile: ${PROTO_START}${payload}`;
  const result = parse(input);
  expect(result.length).toBe(2);
  expect(result[0]).toEqual({ type: "text", content: "Here is the user profile: " });
  const expectedDecoded = decode(payload);
  expect(result[1]).toEqual({ type: "mz", content: payload, data: expectedDecoded });
});

// Test multiple MZ blocks in one stream
test("parse multiple MZ blocks", () => {
  const payload1 = encode({ foo: "bar" });
  const payload2 = encode({ baz: "qux" });
  const input = `first ${PROTO_START}${payload1}${PROTO_END} middle ${PROTO_START}${payload2}${PROTO_END} last`;
  const result = parse(input);
  expect(result.length).toBe(5);
  expect(result[0]).toEqual({ type: "text", content: "first " });
  expect(result[1]).toEqual({ type: "mz", content: payload1, data: decode(payload1) });
  expect(result[2]).toEqual({ type: "text", content: " middle " });
  expect(result[3]).toEqual({ type: "mz", content: payload2, data: decode(payload2) });
  expect(result[4]).toEqual({ type: "text", content: " last" });
});

// Test encodeResult with primitive value
test("encodeResult wraps primitive values in object with value key and adds header", () => {
  const result = encodeResult("hello world");
  // Check that it starts with PROTO_START
  expect(result.startsWith(PROTO_START)).toBe(true);
  // Check that it has inline decoder
  expect(result.includes("MZrules")).toBe(true);
});

// Test encodeResult with empty array
test("encodeResult wraps empty array in object with result key", () => {
  const result = encodeResult([]);
  expect(result.startsWith(PROTO_START)).toBe(true);
  expect(result.includes("MZrules")).toBe(true);
});

// Test encodeResult with empty object
test("encodeResult wraps empty object in object with result key", () => {
  const result = encodeResult({});
  expect(result.startsWith(PROTO_START)).toBe(true);
  expect(result.includes("MZrules")).toBe(true);
});

// Test encodeResult with title
test("encodeResult attaches title symbol when title provided", () => {
  const result = encodeResult({ foo: "bar" }, "Test Title");
  expect(result.startsWith(PROTO_START)).toBe(true);
  expect(result.includes("MZrules")).toBe(true);
});

// Test encodeResult with close marker
test("encodeResult adds close marker when requested", () => {
  const result = encodeResult("test", undefined, true);
  expect(result.startsWith(PROTO_START)).toBe(true);
  expect(result.endsWith(PROTO_END)).toBe(true);
});
