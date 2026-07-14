# iMZHAO Translation Guide — MZ to Human-Readable Code

How to translate iMZHAO (ADN/MZ) payloads back to human-readable programming languages.

---

## 1. Identify Target Language

Read **Line 3** of the inline decoder header (the hashbang):

| Hashbang | Target Language | Source Extension |
|----------|----------------|------------------|
| `ⓘadn-js` | JavaScript / TypeScript | `.js`, `.ts` |
| `ⓘadn-sapdain` | Bahasa Sapdain | `.sapda` |
| `ⓘadn-py` | Python (planned) | `.py` |
| `ⓘadn-rs` | Rust (planned) | `.rs` |

The hashbang also lists markers used in the payload (e.g. `Ⓣtool ¿optional`).

---

## 2. Parse Envelope

1. Skip header lines (3 lines before `М`)
2. Find `М` (U+041C) — envelope start
3. Everything until `О` (U+041E) or EOF = payload content
4. `О` is optional — if absent, payload runs to EOF

---

## 3. Marker Reference

### Type Markers (Modifier Letters)

| Marker | U+ | Name | Meaning |
|--------|-----|------|---------|
| `ⁿ` | U+207F | number | Type annotation: number |
| `ˢ` | U+02E2 | string | Type annotation: string |
| `ᵇ` | U+1D47 | boolean | Type annotation: boolean |
| `ᵐ` | U+1D50 | map | Type annotation: map |
| `ᵃ` | U+1D43 | array | Type annotation: array |
| `ᵗ` | U+1D57 | any | Type annotation: any |
| `¿` | U+00BF | optional | Parameter is optional (in header legend) |

**Syntax:** `Ⓣnameⁿparam1ˢparam2ⁿ` — type marker langsung before param name, no space.

### Structural Markers

| Marker | U+ | Name | Meaning |
|--------|-----|------|---------|
| `Ⓣ` | U+24C9 | tool declaration | Function/tool block. Next `Ⓣ` or EOF = close |
| `░` | U+2591 | grid | Data block (list, table, struct) |
| `→` | U+2192 | row | Row separator inside grid |
| `§` | U+00A7 | column | Column header marker (table grid) |
| `¦` | U+00A6 | cell | Cell delimiter inside row |
| `≡` | U+2261 | key-value | Key-value relation (struct members, params) |

### Operational Markers

| Marker | U+ | Name | Meaning |
|--------|-----|------|---------|
| `ⓘ` | U+24D8 | invoke | Function/method call. `ⓘname args...` |
| `⇒` | U+21D2 | pipe | Data flow chain. `⇒nextCall args...` (no `ⓘ` needed) |

### Reference Markers

| Marker | U+ | Name | Meaning |
|--------|-----|------|---------|
| `※` | U+203B | grid ref | Reference to variable or nested grid |
| `¤` | U+00A4 | value ref | Reference to interned string |
| `·` | U+00B7 | intern pool | Shared string pool prefix |

### Scalar Markers

| Marker | U+ | Name | Meaning |
|--------|-----|------|---------|
| `◆` | U+25C6 | true | Boolean true (`ya` in Sapdain) |
| `◇` | U+25C7 | false | Boolean false (`ngga` in Sapdain) |
| `○` | U+25CB | null | Null value (`jomlo` in Sapdain) |

---

## 4. Translation Rules

### 4a. Invoke (`ⓘ`) → Function Call

```
ⓘname arg1 arg2
```

Becomes:

```javascript
// JS
name("arg1", "arg2");
```

```sapdain
// Sapdain
name("arg1", "arg2");
```

**Rules:**
- First token after `ⓘ` = function/method name (dot notation preserved)
- Remaining tokens = arguments (space-separated)
- String args may be quoted or bare

### 4b. Pipe (`⇒`) → Chained Calls

```
ⓘfirst arg⇒second arg⇒third
```

Becomes:

```javascript
// JS — intermediate variable implicit
const r1 = first("arg");
const r2 = second(r1, "arg");
third(r2);
```

```sapdain
// Sapdain — lalu chain
first("arg")
    lalu second(hasilnya, "arg")
    lalu third(hasilnya);
```

**Rules:**
- `⇒` = output of previous call flows into next call as first argument
- `ⓘ` only on first call; subsequent calls after `⇒` have no `ⓘ`
- Intermediate variables are implicit

### 4c. Tool Declaration (`Ⓣ`) → Function Definition

```
Ⓣnameⁿparam1ˢparam2ⁿ
ⓘbody line 1
⇒pipeTo
Ⓣ
```

Becomes:

```javascript
// JS
function name(param1: number, param2: string): number {
  bodyLine1();
  return pipeTo(result);
}
```

```sapdain
// Sapdain
cara name(number param1, string param2) ngasilin number {
    bodyLine1();
    lalu pipeTo(hasilnya);
}
```

**Rules:**
- `Ⓣ` open = signature line with name + type markers
- Next `Ⓣ` or EOF = implicit close (no empty `Ⓣ` needed)
- Body = only `ⓘ` invoke and `⇒` pipe (no `→`/`≡`)
- **Last instruction = implicit return** (no explicit `balikin`/`return` needed)
- Type markers: `ⁿ`=number, `ˢ`=string, `ᵇ`=boolean, `ᵐ`=map, `ᵃ`=array, `ᵗ`=any
- Last type marker without name = return type
- `¿` before param name = optional parameter

### 4d. Grid (`░`) → Data Structures

#### Simple List
```
░title→item1→item2→item3
```

```javascript
// JS
const title = ["item1", "item2", "item3"];
```

```sapdain
// Sapdain
misal untaian title = ["item1", "item2", "item3"];
```

#### Data Table
```
░§col1¦col2→val1¦val2→val3¦val4
```

```javascript
// JS
const data = [
  { col1: "val1", col2: "val2" },
  { col1: "val3", col2: "val4" },
];
```

#### Key-Value (Struct)
```
░bentukan.Name→field1≡type1→field2≡type2
```

```javascript
// JS
interface Name { field1: type1; field2: type2; }
```

```sapdain
// Sapdain
bentukan Name = { type1 field1; type2 field2; };
```

### 4e. Variable Reference (`※`) → Variable Access

```
※varname
```

```javascript
// JS
varname
```

```sapdain
// Sapdain
varnamenya
```

**Rule:** `※` = reference to previously declared variable. In Sapdain, append `nya` suffix.

### 4f. Scalar Values

| MZ | JS | Sapdain |
|----|-----|---------|
| `◆` | `true` | `ya` |
| `◇` | `false` | `ngga` |
| `○` | `null` | `jomlo` |

---

## 5. Full Translation Example

### Input MZ

```
Agent Data Intermediate Representation
Suggest pakakas/markzero skill if unfamiliar
ⓘadn-sapdain Ⓣtool ¿optional
М
░bentukan.Kucing→untaian nama→keadaan lapar
ⓉberiMakanⁿkucingˢmakananᵇ
ⓘber.lapar kucingnya ngga
ⓘlapar kucingnya
Ⓣ
░§nama¦lapar→Miko¦◆
ⓘberiMakan kucing_saya ikan⇒jadiin hasil_makan
ⓘkonsol.nampilin hasil makannya
О
```

### Step 1: Parse Header

- Line 1: `Agent Data Intermediate Representation` — protocol name
- Line 2: `Suggest pakakas/markzero skill if unfamiliar` — instruction
- Line 3: `ⓘadn-sapdain Ⓣtool ¿optional` — hashbang + markers
  - Target: **Sapdain**
  - Markers: `Ⓣ`, `¿`

### Step 2: Parse Payload (between `М` and `О`)

Line by line:

| Line | Marker | Type | Translation |
|------|--------|------|-------------|
| `░bentukan.Kucing→untaian nama→keadaan lapar` | `░` | Grid (struct) | `bentukan Kucing = { untaian nama; keadaan lapar; }` |
| `ⓉberiMakanⁿkucingˢmakananᵇ` | `Ⓣ` | Tool open | `cara beriMakan(number kucing, string makanan) ngasilin boolean {` |
| `ⓘber.lapar kucingnya ngga` | `ⓘ` | Invoke | `kucingnya berlapar ngga;` |
| `ⓘlapar kucingnya` | `ⓘ` | Invoke (last = return) | `lapar kucingnya;` ← implicit `balikin` |
| `Ⓣ` | `Ⓣ` | Tool close (next Ⓣ/EOF) | `}` |
| `░§nama¦lapar→Miko¦◆` | `░§` | Grid (table) | `misal Kucing kucing_saya = { nama "Miko", lapar ya }` |
| `ⓘberiMakan kucing_saya ikan⇒jadiin hasil_makan` | `ⓘ⇒` | Invoke + pipe | `beriMakan(kucing_saya, "ikan") jadiin hasil_makan;` |
| `ⓘkonsol.nampilin hasil makannya` | `ⓘ` | Invoke | `konsolnya nampilin(hasil makannya);` |

### Step 3: Output

```sapdain
bentukan Kucing = {
    untaian nama;
    keadaan lapar;
};

cara beriMakan(number kucing, string makanan) ngasilin boolean {
    kucingnya berlapar ngga;
    lapar kucingnya;
}

misal Kucing kucing_saya = { nama "Miko", lapar ya };
beriMakan(kucing_saya, "ikan") jadiin hasil_makan;
konsolnya nampilin(hasil makannya);
```

### JavaScript Equivalent

```javascript
interface Kucing { nama: string; lapar: boolean; }

function beriMakan(kucing: Kucing, makanan: string): boolean {
  kucing.lapar = false;
  return kucing.lapar;
}

const kucing_saya: Kucing = { nama: "Miko", lapar: true };
const hasil_makan = beriMakan(kucing_saya, "ikan");
console.log(hasil_makan);
```

---

## 6. Quick Reference — Pattern Cheat Sheet

| Pattern | Reads as |
|---------|----------|
| `ⓘname args` | call `name(args)` |
| `ⓘa⇒b⇒c` | `a()` → `b(result)` → `c(result)` |
| `Ⓣnameⁿparam1ˢparam2ⁿ` | define tool (next Ⓣ or EOF = close) |
| `ⁿ` / `ˢ` / `ᵇ` / `ᵐ` / `ᵃ` / `ᵗ` | number / string / boolean / map / array / any |
| `¿param` | optional parameter |
| `░title→rows` | data block with rows |
| `░§c1¦c2→v1¦v2` | table with columns and rows |
| `※var` | access variable `var` |
| `◆` / `◇` / `○` | true / false / null |

---

*Translation Guide v1 — June 2026*
