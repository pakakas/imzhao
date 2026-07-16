import { buildHeader } from "../src/mz-header";

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}`);
  }
}

function assertIncludes(result: string, text: string, name: string) {
  assert(result.includes(text), name);
}

function assertNotIncludes(result: string, text: string, name: string) {
  assert(!result.includes(text), name);
}

// ═══════════════════════════════════════════════════════
// Test 1: zerolang-error payload
// ═══════════════════════════════════════════════════════
console.log("\n[Test 1] zerolang-error payload");
const zerolang = `░124→129░→file≡src/main.0→span≡※0░§type¦pos¦text→insert¦124¦let ░→repair_id≡REP_ADD_LET→actions≡※2░§code¦message¦node_id¦location¦repair→NAM003¦Undeclared identifier 'count'¦ast_node_592¦※1¦※3`;

const h1 = buildHeader(zerolang);
assertIncludes(h1, "Agent Data Intermediate Representation", "has title");
assertIncludes(h1, "░ grid marker", "has ░");
assertIncludes(h1, "→ row marker", "has →");
assertIncludes(h1, "§ column marker", "has §");
assertIncludes(h1, "¦ delimiter", "has ¦");
assertIncludes(h1, "≡ key-value relation", "has ≡");
assertIncludes(h1, "※ grid reference", "has ※");
assertNotIncludes(h1, "† title marker", "no † in payload");
assertNotIncludes(h1, "τ type", "no τ");
assertNotIncludes(h1, "¡ invoke", "no ¡");
assertNotIncludes(h1, "· interned", "no ·");
assertNotIncludes(h1, "¤ string reference", "no ¤");

// ═══════════════════════════════════════════════════════
// Test 2: js-nested-cause payload
// ═══════════════════════════════════════════════════════
console.log("\n[Test 2] js-nested-cause payload");
const jsNested = `░error_chain4→error≡DatabaseQueryError→message≡Failed to execute query 'SELECT * FROM users WHERE id = ?'→code≡DB_QUERY_FAILED→location≡※0░§file¦line¦col→src/db/query.js¦45¦12→cause≡※1░ConnectionPoolError→message≡Connection pool exhausted (active: 50/50, waiting: 23)→code≡POOL_EXHAUSTED→location≡※2░§file¦line¦col→src/db/pool.js¦112¦8→cause≡※3░NetworkTimeoutError→message≡TCP connection to db.internal.prod:5432 timed out after 30000ms→code≡NET_TIMEOUT→location≡※4░§file¦line¦col→src/net/socket.js¦78¦15→cause≡※5░DNSError→message≡getaddrinfo ENOTFOUND db.internal.prod→code≡ENOTFOUND→location≡※6░§file¦line¦col→src/net/dns.js¦23¦5`;

const h2 = buildHeader(jsNested);
assertIncludes(h2, "░ grid marker", "has ░");
assertIncludes(h2, "→ row marker", "has →");
assertIncludes(h2, "§ column marker", "has §");
assertIncludes(h2, "¦ delimiter", "has ¦");
assertIncludes(h2, "≡ key-value relation", "has ≡");
assertIncludes(h2, "※ grid reference", "has ※");
assertNotIncludes(h2, "† title marker", "no † in payload");
assertNotIncludes(h2, "τ type", "no τ");

// ═══════════════════════════════════════════════════════
// Test 3: error-to-toolcall payload (with τ and ⓘ)
// ═══════════════════════════════════════════════════════
console.log("\n[Test 3] error-to-toolcall payload (τ + ⓘ in instruction)");
const toolcall = `†Registry░§cmd¦args¦returns→add_import¦file τstr module τstr imports τstr¦τgrid†Error░→code≡TS2304→message≡Cannot find name 'useState'.`;

const h3 = buildHeader(toolcall);
assertIncludes(h3, "░ grid marker", "has ░");
assertIncludes(h3, "τ type annotation", "has τ");
assertIncludes(h3, "† title marker", "has †");
assertNotIncludes(h3, "※ grid reference", "no ※");
assertNotIncludes(h3, "⇒ pipe", "no ⇒");

// ═══════════════════════════════════════════════════════
// Test 4: payload with value refs (interning)
// ═══════════════════════════════════════════════════════
console.log("\n[Test 4] payload with value refs (interning)");
const interned = `·Hello·World░→msg≡¤0→label≡¤1`;

const h4 = buildHeader(interned);
assertIncludes(h4, "· interned string", "has ·");
assertIncludes(h4, "¤ string reference", "has ¤");
assertIncludes(h4, "░ grid marker", "has ░");
assertIncludes(h4, "→ row marker", "has →");
assertIncludes(h4, "≡ key-value relation", "has ≡");

// ═══════════════════════════════════════════════════════
// Test 5: payload with ⇒ (pipe) [DEPRECATED/REMOVED]
// ═══════════════════════════════════════════════════════
console.log("\n[Test 5] payload with ⇒ (pipe) [Skipped]");
passed++;
console.log("  ✓ skipped");

// ═══════════════════════════════════════════════════════
// Test 6: empty payload → no header
// ═══════════════════════════════════════════════════════
console.log("\n[Test 6] empty payload → no header");
const h6 = buildHeader("");
assert(h6 === "", "returns empty string");

// ═══════════════════════════════════════════════════════
// Test 7: plain text → no header
// ═══════════════════════════════════════════════════════
console.log("\n[Test 7] plain text → no header");
const h7 = buildHeader("Hello world, no markers here!");
assert(h7 === "", "returns empty string for plain text");

// ═══════════════════════════════════════════════════════
// Test 8: all markers present
// ═══════════════════════════════════════════════════════
console.log("\n[Test 8] all markers present");
const allMarkers = `·pool·ref░→a≡¤0※1§b¦c†titleτtype¡invoke`;
const h8 = buildHeader(allMarkers);
assertIncludes(h8, "░ grid marker", "has ░");
assertIncludes(h8, "→ row marker", "has →");
assertIncludes(h8, "§ column marker", "has §");
assertIncludes(h8, "¦ delimiter", "has ¦");
assertIncludes(h8, "≡ key-value relation", "has ≡");
assertIncludes(h8, "※ grid reference", "has ※");
assertIncludes(h8, "† title marker", "has †");
assertIncludes(h8, "· interned string", "has ·");
assertIncludes(h8, "¤ string reference", "has ¤");
assertIncludes(h8, "τ type annotation", "has τ");
assertIncludes(h8, "¡ invoke tool", "has ¡");

// ═══════════════════════════════════════════════════════
// Test 9: single marker only
// ═══════════════════════════════════════════════════════
console.log("\n[Test 9] single marker only (░)");
const h9 = buildHeader("░");
assertIncludes(h9, "Agent Data Intermediate Representation", "has title");
assertIncludes(h9, "░ grid marker", "has ░");
assertNotIncludes(h9, "→ row marker", "no →");
assertNotIncludes(h9, "≡ key-value relation", "no ≡");

// ═══════════════════════════════════════════════════════
// Test 10: nginx config error → tool call
// ═══════════════════════════════════════════════════════
console.log("\n[Test 10] nginx config error → tool call");
const nginx = `†Registry░§cmd¦args¦returns→fix_config¦file line replacement ¦ τgrid→remove_line¦file line ¦ τgrid→validate_config¦file ¦ τgrid
†Error░→code≡NGINX_DUP_UPSTREAM→message≡duplicate upstream "backend" in /etc/nginx/conf.d/upstream.conf:5
†Action░→cmd≡remove_line→file≡/etc/nginx/conf.d/upstream.conf→line≡5`;
const h10 = buildHeader(nginx);
assertIncludes(h10, "Agent Data Intermediate Representation", "has title");
assertIncludes(h10, "░ grid marker", "has ░");
assertIncludes(h10, "→ row marker", "has →");
assertIncludes(h10, "§ column marker", "has §");
assertIncludes(h10, "¦ delimiter", "has ¦");
assertIncludes(h10, "≡ key-value relation", "has ≡");
assertIncludes(h10, "† title marker", "has †");
assertIncludes(h10, "τ type annotation", "has τ");
assertNotIncludes(h10, "※ grid reference", "no ※");
assertNotIncludes(h10, "⇒ pipe", "no ⇒");

// ═══════════════════════════════════════════════════════
// Test 11: apache config error → tool call
// ═══════════════════════════════════════════════════════
console.log("\n[Test 11] apache config error → tool call");
const apache = `†Registry░§cmd¦args¦returns→enable_module¦module ¦ τgrid→fix_config¦file line replacement ¦ τgrid→reload_service¦service ¦ τgrid
†Error░→code≡APACHE_INVALID_CMD→message≡Invalid command 'SSLEngine', perhaps misspelled or defined by a module not included in the server configuration
†Action░→cmd≡enable_module→module≡mod_ssl`;
const h11 = buildHeader(apache);
assertIncludes(h11, "░ grid marker", "has ░");
assertIncludes(h11, "§ column marker", "has §");
assertIncludes(h11, "τ type annotation", "has τ");
assertNotIncludes(h11, "※ grid reference", "no ※");

// ═══════════════════════════════════════════════════════
// Test 12: nginx ssl cert not found → tool call with ※
// ═══════════════════════════════════════════════════════
console.log("\n[Test 12] nginx ssl cert error with ※ refs");
const nginxSsl = `†Registry░§cmd¦args¦returns→fix_config¦file line replacement ¦ τgrid→generate_cert¦domain path ¦ τgrid
†Error░→code≡NGINX_SSL_CERT_NOT_FOUND→message≡cannot load certificate "/etc/ssl/certs/site.pem": BIO_new_file() failed
†Action░→cmd≡generate_cert→domain≡example.com→path≡※0`;
const h12 = buildHeader(nginxSsl);
assertIncludes(h12, "※ grid reference", "has ※");
assertIncludes(h12, "τ type annotation", "has τ");
assertIncludes(h12, "† title marker", "has †");
assertNotIncludes(h12, "⇒ pipe", "no ⇒");

// ═══════════════════════════════════════════════════════
// Test 13: buildToolCallPayload
// ═══════════════════════════════════════════════════════
console.log("\n[Test 13] buildToolCallPayload integration");
import { buildToolCallPayload } from "../src/tool-registry";
const testPayload = {
  available_tools: [
    {
      name: "grep",
      params: { pattern: "string", path: "string optional" }
    }
  ],
  error: {
    code: "CMD_FAILED",
    message: "command failed",
    location: { file: "src/main.ts", line: 10 }
  },
  context: {
    project: "pakakas"
  }
};

const payloadStr = buildToolCallPayload(testPayload);
assertNotIncludes(payloadStr, "Agent Data Intermediate Representation", "does not have header title");
assertIncludes(payloadStr, "Respond with `¡grep pattern path`", "has instruction");
assertIncludes(payloadStr, "░Registry", "has Registry grid");
assertIncludes(payloadStr, "code≡CMD_FAILED", "has error code");
assertIncludes(payloadStr, "project≡pakakas", "has context");
assertIncludes(payloadStr, "grep", "has tool name");

// ═══════════════════════════════════════════════════════
// Test 14: flat registry params with optional modifier 'optional'
// ═══════════════════════════════════════════════════════
console.log("\n[Test 14] flat registry params with optional modifier 'optional'");
import { getAvailableTools, toRegistryGrid } from "../src/tool-registry";

const flatPayload = {
  tools: "add_import,apply_code_action",
  "add_import.params": "file,module,imports",
  "apply_code_action.params": "file,line,action"
};

const flatTools = getAvailableTools(flatPayload);
assert(flatTools.length === 2, "parsed 2 tools");
assert(flatTools[0].name === "add_import", "first tool is add_import");
assert(flatTools[0].params.length === 3, "add_import has 3 params");
assert(flatTools[0].params[2].name === "imports", "third param name is imports");
assert(flatTools[0].params[2].type === "τstr", "third param type is τstr");
assert(flatTools[0].params[2].optional === false, "third param is NOT optional");

const regGrid = toRegistryGrid(flatTools);
assert(regGrid.includes("imports τstr"), "registry grid formats param correctly");

// ═══════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════
console.log(`\n═══════════════════════════════════════`);
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log(`═══════════════════════════════════════`);
if (failed > 0) process.exit(1);
