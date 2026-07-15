// Inline Decoder Header utilities

import { MARKERS } from "@pakakas/markzero";

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
