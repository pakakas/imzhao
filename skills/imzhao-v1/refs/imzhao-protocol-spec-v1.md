# iMZHAO Protocol Specification (v1)

## Overview
**iMZHAO (MarkZero Hybrid AgentOps)** is the Agent Intermediate Representation (AIR) protocol designed for handling the encapsulation, parsing, and execution of autonomous machine instructions and data within LLM text streams.

While humans use visual brackets (`{ }`, `[ ]`) or markdown blocks (```` ``` ````) to separate data from conversation, iMZHAO operates optimally in the latent space of Language Models by using zero-overhead **1-token switch markers**.

## 1. Protocol Stream Markers (The Envelope)
These markers belong exclusively to the iMZHAO protocol. They act as "switches" that instruct the stream parser to stop routing tokens to human chat and start routing them to the machine decoder (and vice versa).

| Role | Char | Unicode Name | Description |
| :--- | :---: | :--- | :--- |
| **Start Marker** | `ⓜ` | U+24DC (CIRCLED LATIN SMALL LETTER M) | Safely switches the stream from human mode to machine mode. |
| **Close Marker** | `ⓩ` | U+24E9 (CIRCLED LATIN SMALL LETTER Z) | Ends the machine data block and returns to human mode. |

### 1.1 Encapsulation Rules
1. **The Switch Concept**: The iMZHAO parser treats the text stream as default "Human text". The moment `ⓜ` is encountered, the stream context switches to "Machine data". 
2. **Optional Closure**: The close marker `ⓩ` is completely **optional**. If a stream reaches the End of File (EOF), the parser implicitly closes the machine context. `ⓩ` is only strictly required if the LLM intends to write further human-readable text *after* the machine data block.
3. **Purity of Payload**: Everything between `ⓜ` and `ⓩ` is considered the pure payload. For data representation, iMZHAO utilizes **ADN (Agent Data Notation)** via the `@pakakas/markzero` library.

## 2. Integration with ADN
iMZHAO is the carrier envelope; ADN is the payload.
When a iMZHAO parser extracts the payload between `ⓜ` and `ⓩ` (or EOF), it passes the pure inner string to the ADN decoder.

Example Stream:
```text
Here is the user profile you requested:
ⓜ❖hyuze❖adminⓖʀ¤0→¤1ⓩ
Please let me know if you need anything else!
```
- The iMZHAO parser captures `❖hyuze❖adminⓖʀ¤0→¤1`.
- The string is sent to the ADN Decoder (`@pakakas/markzero`), which converts it to `[{ hyuze: "admin" }]`.

---
*Official iMZHAO Protocol Specification - Monday, June 1, 2026*
