import { buildHeader } from "../src/tool-registry";

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
const zerolang = `ⓖ124ʀ129ⓖʀfile→src/main.0ʀspan→※0ⓖᴄtype¦pos¦textʀinsert¦124¦let ⓖʀrepair_id→REP_ADD_LETʀactions→※2ⓖᴄcode¦message¦node_id¦location¦repairʀNAM003¦Undeclared identifier 'count'¦ast_node_592¦※1¦※3`;

const h1 = buildHeader(zerolang);
assertIncludes(h1, "Agent Data Intermediate Representation", "has title");
assertIncludes(h1, "ⓖ is grid marker", "has ⓖ");
assertIncludes(h1, "ʀ is row marker", "has ʀ");
assertIncludes(h1, "ᴄ is column marker", "has ᴄ");
assertIncludes(h1, "¦ is delimiter", "has ¦");
assertIncludes(h1, "→ is key-value relation", "has →");
assertIncludes(h1, "※ is grid reference", "has ※");
assertNotIncludes(h1, "★ is title marker", "no ★ in payload");
assertNotIncludes(h1, "ɛ is escape", "no ɛ");
assertNotIncludes(h1, "τ is type", "no τ");
assertNotIncludes(h1, "ⓘ is invoke", "no ⓘ");
assertNotIncludes(h1, "⇒ is pipe", "no ⇒");
assertNotIncludes(h1, "· is interned", "no ·");
assertNotIncludes(h1, "¤ is string reference", "no ¤");

// ═══════════════════════════════════════════════════════
// Test 2: js-nested-cause payload
// ═══════════════════════════════════════════════════════
console.log("\n[Test 2] js-nested-cause payload");
const jsNested = `ⓖerror_chain4ʀerror→DatabaseQueryErrorʀmessage→Failed to execute query 'SELECT * FROM users WHERE id = ?'ʀcode→DB_QUERY_FAILEDʀlocation→※0ⓖᴄfile¦line¦colʀsrc/db/query.js¦45¦12ʀcause→※1ⓖConnectionPoolErrorʀmessage→Connection pool exhausted (active: 50/50, waiting: 23)ʀcode→POOL_EXHAUSTEDʀlocation→※2ⓖᴄfile¦line¦colʀsrc/db/pool.js¦112¦8ʀcause→※3ⓖNetworkTimeoutErrorʀmessage→TCP connection to db.internal.prod:5432 timed out after 30000msʀcode→NET_TIMEOUTʀlocation→※4ⓖᴄfile¦line¦colʀsrc/net/socket.js¦78¦15ʀcause→※5ⓖDNSErrorʀmessage→getaddrinfo ENOTFOUND db.internal.prodʀcode→ENOTFOUNDʀlocation→※6ⓖᴄfile¦line¦colʀsrc/net/dns.js¦23¦5`;

const h2 = buildHeader(jsNested);
assertIncludes(h2, "ⓖ is grid marker", "has ⓖ");
assertIncludes(h2, "ʀ is row marker", "has ʀ");
assertIncludes(h2, "ᴄ is column marker", "has ᴄ");
assertIncludes(h2, "¦ is delimiter", "has ¦");
assertIncludes(h2, "→ is key-value relation", "has →");
assertIncludes(h2, "※ is grid reference", "has ※");
assertNotIncludes(h2, "★ is title marker", "no ★ in payload");
assertNotIncludes(h2, "ɛ is escape", "no ɛ");
assertNotIncludes(h2, "τ is type", "no τ");

// ═══════════════════════════════════════════════════════
// Test 3: error-to-toolcall payload (with τ and ⓘ)
// ═══════════════════════════════════════════════════════
console.log("\n[Test 3] error-to-toolcall payload (τ + ⓘ in instruction)");
const toolcall = `★Registryⓖᴄcmd¦args¦returnsʀadd_import¦file τstr module τstr imports τstr¦τgrid★Errorⓖʀcode→TS2304ʀmessage→Cannot find name 'useState'.`;

const h3 = buildHeader(toolcall);
assertIncludes(h3, "ⓖ is grid marker", "has ⓖ");
assertIncludes(h3, "τ is type annotation", "has τ");
assertIncludes(h3, "★ is title marker", "has ★");
assertNotIncludes(h3, "※ is grid reference", "no ※");
assertNotIncludes(h3, "ɛ is escape", "no ɛ");
assertNotIncludes(h3, "⇒ is pipe", "no ⇒");

// ═══════════════════════════════════════════════════════
// Test 4: payload with escape char
// ═══════════════════════════════════════════════════════
console.log("\n[Test 4] payload with escape char");
const escaped = `ⓖʀfile→src/main.0ʀtext→Hello ɛ→ World`;

const h4 = buildHeader(escaped);
assertIncludes(h4, "→ is key-value relation", "has →");
assertIncludes(h4, "ɛ is escape marker", "has ɛ");
assertNotIncludes(h4, "※ is grid reference", "no ※");
assertNotIncludes(h4, "τ is type", "no τ");

// ═══════════════════════════════════════════════════════
// Test 5: payload with value refs (interning)
// ═══════════════════════════════════════════════════════
console.log("\n[Test 5] payload with value refs (interning)");
const interned = `·Hello·Worldⓖʀmsg→¤0ʀlabel→¤1`;

const h5 = buildHeader(interned);
assertIncludes(h5, "· is interned string", "has ·");
assertIncludes(h5, "¤ is string reference", "has ¤");
assertIncludes(h5, "ⓖ is grid marker", "has ⓖ");
assertIncludes(h5, "→ is key-value relation", "has →");
assertNotIncludes(h5, "ɛ is escape", "no ɛ");

// ═══════════════════════════════════════════════════════
// Test 6: payload with ⇒ (pipe)
// ═══════════════════════════════════════════════════════
console.log("\n[Test 6] payload with ⇒ (pipe)");
const piped = `ⓖʀaction→insert⇒grep "const"`;

const h6 = buildHeader(piped);
assertIncludes(h6, "⇒ is pipe operator", "has ⇒");
assertIncludes(h6, "ⓖ is grid marker", "has ⓖ");
assertNotIncludes(h6, "τ is type", "no τ");

// ═══════════════════════════════════════════════════════
// Test 7: empty payload → no header
// ═══════════════════════════════════════════════════════
console.log("\n[Test 7] empty payload → no header");
const h7 = buildHeader("");
assert(h7 === "", "returns empty string");

// ═══════════════════════════════════════════════════════
// Test 8: plain text → no header
// ═══════════════════════════════════════════════════════
console.log("\n[Test 8] plain text → no header");
const h8 = buildHeader("Hello world, no markers here!");
assert(h8 === "", "returns empty string for plain text");

// ═══════════════════════════════════════════════════════
// Test 9: all markers present
// ═══════════════════════════════════════════════════════
console.log("\n[Test 9] all markers present");
const allMarkers = `·pool·refⓖʀa→¤0※1ᴄb¦c★titleɛesc⇒pipeτtypeⓘinvoke`;
const h9 = buildHeader(allMarkers);
assertIncludes(h9, "ⓖ is grid marker", "has ⓖ");
assertIncludes(h9, "ʀ is row marker", "has ʀ");
assertIncludes(h9, "ᴄ is column marker", "has ᴄ");
assertIncludes(h9, "¦ is delimiter", "has ¦");
assertIncludes(h9, "→ is key-value relation", "has →");
assertIncludes(h9, "※ is grid reference", "has ※");
assertIncludes(h9, "★ is title marker", "has ★");
assertIncludes(h9, "· is interned string", "has ·");
assertIncludes(h9, "¤ is string reference", "has ¤");
assertIncludes(h9, "ɛ is escape marker", "has ɛ");
assertIncludes(h9, "⇒ is pipe operator", "has ⇒");
assertIncludes(h9, "τ is type annotation", "has τ");
assertIncludes(h9, "ⓘ is invoke tool call", "has ⓘ");

// ═══════════════════════════════════════════════════════
// Test 10: single marker only
// ═══════════════════════════════════════════════════════
console.log("\n[Test 10] single marker only (ⓖ)");
const h10 = buildHeader("ⓖ");
assertIncludes(h10, "Agent Data Intermediate Representation", "has title");
assertIncludes(h10, "ⓖ is grid marker", "has ⓖ");
assertNotIncludes(h10, "ʀ is row marker", "no ʀ");
assertNotIncludes(h10, "→ is key-value relation", "no →");

// ═══════════════════════════════════════════════════════
// Test 11: nginx config error → tool call
// Error: duplicate upstream "backend" in nginx.conf
// Action: remove duplicate upstream block at line 5
// ═══════════════════════════════════════════════════════
console.log("\n[Test 11] nginx config error → tool call");
const nginx = `★Registryⓖᴄcmd¦args¦returnsʀfix_config¦file line replacement ¦ τgridʀremove_line¦file line ¦ τgridʀvalidate_config¦file ¦ τgrid
★Errorⓖʀcode→NGINX_DUP_UPSTREAMʀmessage→duplicate upstream "backend" in /etc/nginx/conf.d/upstream.conf:5
★Actionⓖʀcmd→remove_lineʀfile→/etc/nginx/conf.d/upstream.confʀline→5`;
const h11 = buildHeader(nginx);
assertIncludes(h11, "Agent Data Intermediate Representation", "has title");
assertIncludes(h11, "ⓖ is grid marker", "has ⓖ");
assertIncludes(h11, "ʀ is row marker", "has ʀ");
assertIncludes(h11, "ᴄ is column marker", "has ᴄ");
assertIncludes(h11, "¦ is delimiter", "has ¦");
assertIncludes(h11, "→ is key-value relation", "has →");
assertIncludes(h11, "★ is title marker", "has ★");
assertIncludes(h11, "τ is type annotation", "has τ");
assertNotIncludes(h11, "※ is grid reference", "no ※");
assertNotIncludes(h11, "ɛ is escape", "no ɛ");
assertNotIncludes(h11, "⇒ is pipe", "no ⇒");

// ═══════════════════════════════════════════════════════
// Test 12: apache config error → tool call
// Error: Invalid command 'SSLEngine', module not loaded
// Action: enable mod_ssl module
// ═══════════════════════════════════════════════════════
console.log("\n[Test 12] apache config error → tool call");
const apache = `★Registryⓖᴄcmd¦args¦returnsʀenable_module¦module ¦ τgridʀfix_config¦file line replacement ¦ τgridʀreload_service¦service ¦ τgrid
★Errorⓖʀcode→APACHE_INVALID_CMDʀmessage→Invalid command 'SSLEngine', perhaps misspelled or defined by a module not included in the server configuration
★Actionⓖʀcmd→enable_moduleʀmodule→mod_ssl`;
const h12 = buildHeader(apache);
assertIncludes(h12, "ⓖ is grid marker", "has ⓖ");
assertIncludes(h12, "ᴄ is column marker", "has ᴄ");
assertIncludes(h12, "τ is type annotation", "has τ");
assertNotIncludes(h12, "※ is grid reference", "no ※");
assertNotIncludes(h12, "ɛ is escape", "no ɛ");

// ═══════════════════════════════════════════════════════
// Test 13: nginx ssl cert not found → tool call with ※
// Error: SSL cert path not found, refs to previous grids
// ═══════════════════════════════════════════════════════
console.log("\n[Test 13] nginx ssl cert error with ※ refs");
const nginxSsl = `★Registryⓖᴄcmd¦args¦returnsʀfix_config¦file line replacement ¦ τgridʀgenerate_cert¦domain path ¦ τgrid
★Errorⓖʀcode→NGINX_SSL_CERT_NOT_FOUNDʀmessage→cannot load certificate "/etc/ssl/certs/site.pem": BIO_new_file() failed
★Actionⓖʀcmd→generate_certʀdomain→example.comʀpath→※0`;
const h13 = buildHeader(nginxSsl);
assertIncludes(h13, "※ is grid reference", "has ※");
assertIncludes(h13, "τ is type annotation", "has τ");
assertIncludes(h13, "★ is title marker", "has ★");
assertNotIncludes(h13, "ɛ is escape", "no ɛ");
assertNotIncludes(h13, "⇒ is pipe", "no ⇒");

// ═══════════════════════════════════════════════════════
// Test 14: apache .htaccess with escape char
// Error: invalid RewriteRule with special chars
// ═══════════════════════════════════════════════════════
console.log("\n[Test 14] apache .htaccess with escape char");
const htaccess = `★Errorⓖʀcode→APACHE_SYNTAX_ERRORʀmessage→Invalid command 'RewriteRule', perhaps misspelled or defined by a module not included
★Actionⓖʀcmd→fix_configʀfile→/var/www/html/.htaccessʀline→3ʀreplacement→RewriteRule ɛ^ index.php [L]`;
const h14 = buildHeader(htaccess);
assertIncludes(h14, "ɛ is escape marker", "has ɛ");
assertIncludes(h14, "★ is title marker", "has ★");
assertIncludes(h14, "→ is key-value relation", "has →");
assertNotIncludes(h14, "※ is grid reference", "no ※");
assertNotIncludes(h14, "τ is type", "no τ");

// ═══════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════
console.log(`\n═══════════════════════════════════════`);
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log(`═══════════════════════════════════════`);
if (failed > 0) process.exit(1);
