# Comprehensive Token Efficiency Log

*All characters were tested via Live API (Xiaomi MiMo `mimo-v2.5` compatible tokenizer).* 
*The Net Token cost is calculated after subtracting the baseline system prompt overhead (247 tokens).*

## 1. Original MarkZero / MZHAO Protocol Markers
Most of the original MarkZero markers were highly efficient, with only the Escaper failing the 1-token rule.

| Symbol | Name / Role | Byte Size | Net Tokens | Status |
| :---: | :--- | :---: | :---: | :--- |
| `·` | Value Marker | 3 bytes | **1** | ✅ Optimal |
| `ⓖ` | Grid Marker | 3 bytes | **1** | ✅ Optimal |
| `ʀ` | Row Marker | 2 bytes | **1** | ✅ Optimal |
| `ᴄ` | Heading Marker | 3 bytes | **1** | ✅ Optimal |
| `¦` | Separator | 2 bytes | **1** | ✅ Optimal |
| `→` | Relation Binder | 3 bytes | **1** | ✅ Optimal |
| `¤` | Value Ref | 2 bytes | **1** | ✅ Optimal |
| `※` | Grid Ref | 3 bytes | **1** | ✅ Optimal |
| `★` | Title Marker | 3 bytes | **1** | ✅ Optimal |
| `ⓜ` | MZHAO Start | 3 bytes | **1** | ✅ Optimal |
| `ⓩ` | MZHAO End | 3 bytes | **1** | ✅ Optimal |
| `Ɇ` | Escaper | 2 bytes | **2** | ❌ Inefficient |

## 2. Pakakas AI Protocol (PAP) v1 (Hexafecta)
The internal `pakakas-dev` standard utilizes semantic Unicode naming. While philosophically beautiful, it suffered heavy token fragmentation.

| Symbol | Name / Role | Byte Size | Net Tokens | Status |
| :---: | :--- | :---: | :---: | :--- |
| `℘` | Protocol Id (SCRIPT P) | 3 bytes | **1** | ✅ Optimal |
| `℣` | Vocab Prefix (VERSICLE) | 3 bytes | **1** | ✅ Optimal |
| `ℭ` | Column Prefix (BLACK-LETTER C) | 3 bytes | **1** | ✅ Optimal |
| `ℳ` | Meta Prefix (SCRIPT M) | 3 bytes | **1** | ✅ Optimal |
| `⊞` | Grid Prefix (SQUARED PLUS) | 3 bytes | **1** | ✅ Optimal |
| `⊺` | Title Prefix (INTERCALATE) | 3 bytes | **2** | ❌ Inefficient |
| `␟` | Data Separator (UNIT SEPARATOR) | 3 bytes | **2** | ❌ Inefficient |
| `␞` | Row Prefix (RECORD SEPARATOR) | 3 bytes | **2** | ❌ Inefficient |
| `ⅈ` | Var Ref (DOUBLE-STRUCK I) | 3 bytes | **2** | ❌ Inefficient |
| `⩴` | Rel Binder (DOUBLE COLON EQUAL) | 3 bytes | **3** | ⚠️ Highly Inefficient |

## 3. Alternative Candidates Tested
The following symbols were tested as replacements for the failing markers (Escaper, Pipeline, Tau).

### Escaper Candidates (Replacing `Ɇ`)
| Symbol | Unicode Name | Net Tokens | Status |
| :---: | :--- | :---: | :--- |
| `¬` | Logical Not | **1** | ✅ Optimal |
| `‡` | Double Dagger | **1** | ✅ Optimal |
| `†` | Dagger | **1** | ✅ Optimal |
| `§` | Section Sign | **1** | ✅ Optimal |
| `¶` | Pilcrow Sign | **1** | ✅ Optimal |
| `∆` | Increment / Delta | **1** | ✅ Optimal |
| `◊` | Lozenge | **1** | ✅ Optimal |
| `○` | White Circle | **1** | ✅ Optimal |
| `ε` | Greek Small Epsilon | **1** | ✅ Optimal |
| `Ε` | Greek Capital Epsilon | **1** | ✅ Optimal |
| `ℰ` | Script Capital E | **1** | ✅ Optimal |
| `ℯ` | Script Small e | **1** | ✅ Optimal |
| `ℇ` | Euler Constant | **1** | ✅ Optimal |
| `⑆` | Projective (Alt 1) | **2** | ❌ Inefficient |
| `⦙` | Vertical Zigzag (Alt 2) | **2** | ❌ Inefficient |
| `⍿` | Vertical Line with Mid (Alt 3)| **2** | ❌ Inefficient |
| `␛` | Escape Symbol (Alt 4) | **2** | ❌ Inefficient |
| `⏣` | Benzene Ring (Alt 5) | **2** | ❌ Inefficient |
| `⍚` | Diamond with Dot (Alt 6) | **2** | ❌ Inefficient |
| `⟍` | Math Falling Diagonal (Alt 15)| **2** | ❌ Inefficient |
| `⧵` | Reverse Solidus (Alt 16) | **2** | ❌ Inefficient |

### Pipeline Candidates
| Symbol | Unicode Name | Net Tokens | Status |
| :---: | :--- | :---: | :--- |
| `⇒` | Rightwards Double Arrow | **1** | ✅ Optimal (Chosen) |
| `⫸` | Much Greater Than | **1** | ✅ Optimal |
| `⇛` | Rightwards Triple Arrow | **1** | ✅ Optimal |
| `▹` | White Right-Pointing Triangle| **1** | ✅ Optimal |
| `❯` | Heavy Right Angle Quotation | **1** | ✅ Optimal |
| `┋` | Box Drawings Heavy Dashed | **1** | ✅ Optimal |

### Tau (Topic) Candidates
| Symbol | Unicode Name | Net Tokens | Status |
| :---: | :--- | :---: | :--- |
| `τ` | Greek Small Letter Tau | **1** | ✅ Optimal |
| `⍴` | Greek Rho (Math) | **2** | ❌ Inefficient |

## 4. Local Tokenizer Tests (GPT-4o, Claude, LLaMA-3)
| Symbol | Name | GPT-4o (Tiktoken) | Claude | LLaMA-3 |
| :---: | :--- | :---: | :---: | :---: |
| `·` | Value Marker | ❌ 2 | ❌ 2 | ❌ 4 |
| `ⓖ` | Grid Marker | ❌ 2 | **1** | ❌ 5 |
| `ʀ` | Row Marker | ❌ 2 | ❌ 2 | ❌ 4 |
| `ᴄ` | Heading Marker | ❌ 2 | ❌ 2 | ❌ 5 |
| `¦` | Separator | **1** | **1** | ❌ 3 |
| `→` | Relation Binder | **1** | **1** | ❌ 3 |
| `¤` | Value Ref | **1** | ❌ 2 | ❌ 3 |
| `※` | Grid Ref | **1** | ❌ 2 | ❌ 3 |
| `★` | Title Marker | **1** | ❌ 2 | ❌ 3 |
| `ⓜ` | MZHAO Start | ❌ 2 | **1** | ❌ 5 |
| `ⓩ` | MZHAO End | ❌ 2 | **1** | ❌ 5 |
| `Ɇ` | Escaper (Old) | ❌ 2 | ❌ 2 | ❌ 4 |
| `℘` | Protocol Id | ❌ 2 | ❌ 3 | ❌ 4 |
| `℣` | Vocab Prefix | ❌ 2 | ❌ 3 | ❌ 4 |
| `⊺` | Title Prefix | ❌ 2 | ❌ 2 | ❌ 4 |
| `ℭ` | Column Prefix | ❌ 2 | **1** | ❌ 4 |
| `␟` | Data Separator | ❌ 3 | ❌ 3 | ❌ 5 |
| `ℳ` | Meta Prefix | ❌ 2 | **1** | ❌ 4 |
| `⊞` | Grid Prefix | ❌ 2 | ❌ 2 | ❌ 4 |
| `␞` | Row Prefix | ❌ 3 | ❌ 3 | ❌ 5 |
| `⩴` | Rel Binder | ❌ 3 | ❌ 2 | ❌ 5 |
| `ⅈ` | Var Ref | ❌ 2 | **1** | ❌ 4 |
| `⇒` | Pipe OpAgentic | **1** | ❌ 3 | ❌ 4 |
| `τ` | Tau | **1** | **1** | ❌ 3 |
| `ℰ` | Script Capital E | ❌ 2 | **1** | ❌ 4 |
| `ℯ` | Script Small e | ❌ 2 | **1** | ❌ 4 |
| `ε` | Greek Small Epsilon | **1** | **1** | ❌ 3 |
| `Ε` | Greek Cap Epsilon | **1** | ❌ 2 | ❌ 3 |
| `ℇ` | Euler Constant | ❌ 2 | ❌ 2 | ❌ 4 |
| `¬` | Logical Not | **1** | ❌ 2 | ❌ 3 |
| `‡` | Double Dagger | **1** | **1** | ❌ 3 |
| `†` | Dagger | **1** | **1** | ❌ 3 |
| `§` | Section Sign | **1** | **1** | ❌ 3 |
| `¶` | Pilcrow Sign | **1** | **1** | ❌ 3 |
| `∆` | Delta | **1** | ❌ 2 | ❌ 4 |
| `◊` | Lozenge | ❌ 2 | ❌ 2 | ❌ 4 |
| `○` | White Circle | **1** | ❌ 2 | ❌ 3 |

