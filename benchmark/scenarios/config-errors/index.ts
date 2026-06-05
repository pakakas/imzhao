#!/usr/bin/env bun
import { GPTTokens } from "gpt-tokens";
import { encode, ENC_INTERN_ALL } from "@pakakas/markzero";

const MODEL = "gpt-4o";

function countTokens(text: string) {
  const usage = new GPTTokens({
    model: MODEL as any,
    messages: [{ role: "user", content: text }]
  });
  return usage.usedTokens - 7;
}

const configScenarios = [
  {
    name: "Nginx Syntax Error",
    desc: "Emerg error with file path and line number.",
    data: {
      tool: "nginx",
      status: "fail",
      errors: [
        {
          level: "emerg",
          message: "unknown directive \"proxy_passs\"",
          file: "/etc/nginx/sites-enabled/api.conf",
          line: 45,
          context: "proxy_passs http://localhost:8080;"
        },
        {
          level: "emerg",
          message: "directive \"server_name\" is not terminated by \";\"",
          file: "/etc/nginx/sites-enabled/api.conf",
          line: 48,
          context: "server_name example.com"
        }
      ]
    }
  },
  {
    name: "Systemd Unit Error",
    desc: "Validation error in .service file.",
    data: {
      tool: "systemd-analyze",
      file: "/etc/systemd/system/my-app.service",
      checks: [
        { line: 5, section: "Service", property: "ExecStart", error: "Executable path is not absolute" },
        { line: 10, section: "Install", property: "WantedBy", error: "Unknown target 'multi-user.targett'" }
      ]
    }
  },
  {
    name: "Apache Config Error",
    desc: "Syntax error in apache2.conf.",
    data: {
      tool: "apache2ctl",
      errors: [
        {
          file: "/etc/apache2/apache2.conf",
          line: 50,
          msg: "Invalid command 'AllowOveride', perhaps misspelled",
          suggestion: "Did you mean 'AllowOverride'?"
        }
      ]
    }
  }
];

console.log(`\n🚀 Configuration Error Benchmark (Model: ${MODEL})\n`);
console.log(`${"System/Tool".padEnd(25)} | ${"JSON".padStart(6)} | ${"PAP v1".padStart(6)} | ${"Gain".padStart(8)}`);
console.log("-".repeat(60));

configScenarios.forEach(s => {
  const jsonStr = JSON.stringify(s.data);
  const papStr = encode(s.data, ENC_INTERN_ALL);

  const jsonT = countTokens(jsonStr);
  const papT = countTokens(papStr);

  const gain = ((jsonT - papT) / jsonT * 100).toFixed(1);

  console.log(`${s.name.padEnd(25)} | ${jsonT.toString().padStart(6)} | ${papT.toString().padStart(6)} | ${gain.toString().padStart(7)}%`);
});

console.log("\n✅ Benchmark Complete. PAP handles system configuration errors efficiently.");
