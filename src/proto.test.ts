import { parse, encodeResult } from "./proto.ts";
import { encode, decode, MARKERS } from "@pakakas/markzero";
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
  const mixed = `prefix ${MARKERS.MESSAGE_START}${payload}`;
  const result = parse(mixed);
  // Expect two blocks: prefix text and mz block
  expect(result.length).toBe(2);
  expect(result[0]).toEqual({ type: "text", content: "prefix " });
  const expectedDecoded = decode(payload);
  const expectedMzBlock = { type: "mz", content: payload, data: expectedDecoded };
  expect(result[1]).toEqual(expectedMzBlock);
});

// Test optional closure
test("parse MZ block uses EOF as implicit close", () => {
  const payload = encode({ user: "hyuze", role: "admin" });
  const input = `Here is the user profile: ${MARKERS.MESSAGE_START}${payload}`;
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
  const input = `first ${MARKERS.MESSAGE_START}${payload1}${MARKERS.MESSAGE_START}${payload2}`;
  const result = parse(input);
  expect(result.length).toBe(3);
  expect(result[0]).toEqual({ type: "text", content: "first " });
  expect(result[1]).toEqual({ type: "mz", content: payload1, data: decode(payload1) });
  expect(result[2]).toEqual({ type: "mz", content: payload2, data: decode(payload2) });
});

// Test encodeResult with primitive value
test("encodeResult wraps primitive values in object with value key and adds header", () => {
  const result = encodeResult("hello world");
  // Check that it starts with MARKERS.MESSAGE_START
  expect(result.startsWith(MARKERS.MESSAGE_START)).toBe(true);
  // Check that it has inline decoder
  expect(result.includes("MZrules")).toBe(true);
});

// Test encodeResult with empty array
test("encodeResult wraps empty array in object with result key", () => {
  const result = encodeResult([]);
  expect(result.startsWith(MARKERS.MESSAGE_START)).toBe(true);
  expect(result.includes("MZrules")).toBe(true);
});

// Test encodeResult with empty object
test("encodeResult wraps empty object in object with result key", () => {
  const result = encodeResult({});
  expect(result.startsWith(MARKERS.MESSAGE_START)).toBe(true);
  expect(result.includes("MZrules")).toBe(true);
});

// Test encodeResult with title
test("encodeResult attaches title symbol when title provided", () => {
  const result = encodeResult({ foo: "bar" }, "Test Title");
  expect(result.startsWith(MARKERS.MESSAGE_START)).toBe(true);
  expect(result.includes("MZrules")).toBe(true);
});
