// Inline Decoder Header utilities

import { MARKERS } from "@pakakas/markzero";
import { TYPE_ANNOTATION, INVOKE } from "./constants";

export const ENC_INTERN: number = 1;
const MZ_INLINE_DECODER_BASE = `MZrules${MARKERS.GRID_MARKER}grid${MARKERS.ROW_MARKER}row${MARKERS.COL_MARKER}columns${MARKERS.ROW_SEP}delimiter${MARKERS.KV_RELATION}key-value${MARKERS.GRID_REF}gridreference`;
export const MZ_INLINE_DECODER_INTERN_SUFFIX = `${MARKERS.VALUE_MARKER}intern${MARKERS.VALUE_REF}stringreference`;

function getInlineDecoderHeader(mode: number): string {
  return mode === ENC_INTERN ? `${MZ_INLINE_DECODER_BASE}${MZ_INLINE_DECODER_INTERN_SUFFIX}` : MZ_INLINE_DECODER_BASE;
}

/**
 * Menyuntikkan Inline Decoder (Magic Header) ke dalam payload ADN mentah.
 * Digunakan oleh Agent‑IDE sebelum mengirim data ke LLM.
 */
export function addInlineDecoder(adn: string, mode: number = 0): string {
  return getInlineDecoderHeader(mode) + `\n${adn}`;
}

/**
 * Marker definitions for dynamic header generation.
 */
const ADN_MARKERS: [string, string][] = [
  [MARKERS.GRID_MARKER, "grid marker"],
  [MARKERS.ROW_MARKER, "row marker"],
  [MARKERS.COL_MARKER, "column marker"],
  [MARKERS.ROW_SEP, "delimiter"],
  [MARKERS.KV_RELATION, "key-value relation"],
  [MARKERS.GRID_REF, "grid reference"],
  [MARKERS.TITLE_MARKER, "title marker"],
  [MARKERS.VALUE_MARKER, "interned string"],
  [MARKERS.VALUE_REF, "string reference"],
];

const AIR_MARKERS: [string, string][] = [
  [TYPE_ANNOTATION, "type annotation"],
  [INVOKE, "invoke tool"],
];

/**
 * Builds a smart English header based on which markers actually appear in the ADN payload.
 * Only includes marker explanations that are present in the data.
 */
export function buildHeader(adn: string): string {
  const lines: string[] = [];

  const usedAdn = ADN_MARKERS.filter(([char]) => adn.includes(char));
  const usedAir = AIR_MARKERS.filter(([char]) => adn.includes(char));

  const allUsed = [...usedAdn, ...usedAir];
  if (allUsed.length > 0) {
    lines.push("Agent Data Intermediate Representation");
    for (const [char, desc] of allUsed) {
      lines.push(`${char} ${desc}`);
    }
  }

  return lines.join("\n");
}
