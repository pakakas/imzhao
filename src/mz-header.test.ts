import { addInlineDecoder, ENC_INTERN, MZ_INLINE_DECODER_INTERN_SUFFIX } from "./mz-header.ts";
import { encode } from "@pakakas/markzero";
import { test, expect } from "bun:test";

test("addInlineDecoder adds header to payload", () => {
  const payload = encode([{ test: "data" }]);
  const result = addInlineDecoder(payload);
  expect(result.startsWith("MZrules")).toBe(true);
  expect(result.endsWith(payload)).toBe(true);
  expect(result.includes("\n")).toBe(true);
});

test("addInlineDecoder with ENC_INTERN mode adds intern suffix", () => {
  const payload = encode([{ test: "data" }]);
  const result = addInlineDecoder(payload, ENC_INTERN);
  expect(result.includes(MZ_INLINE_DECODER_INTERN_SUFFIX)).toBe(true);
});

test("addInlineDecoder with default mode does not add intern suffix", () => {
  const payload = encode([{ test: "data" }]);
  const result = addInlineDecoder(payload);
  expect(result.includes(MZ_INLINE_DECODER_INTERN_SUFFIX)).toBe(false);
});
