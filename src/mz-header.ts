// Inline Decoder Header utilities

import { GRID_MARKER, ROW_MARKER, COL_MARKER, ROW_SEP, KV_RELATION, VALUE_REF, GRID_REF, VALUE_MARKER, TITLE_MARKER, ESCAPE_CHAR } from "@pakakas/markzero/src/util";

export const ENC_INTERN: number = 1;
const MZ_INLINE_DECODER_BASE = `MZrules${GRID_MARKER}grid${ROW_MARKER}row${COL_MARKER}columns${ROW_SEP}delimiter${KV_RELATION}is${GRID_REF}gridreference${TITLE_MARKER}title${ESCAPE_CHAR}escape`;
export const MZ_INLINE_DECODER_INTERN_SUFFIX = `${VALUE_MARKER}intern${VALUE_REF}stringreference`;

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
