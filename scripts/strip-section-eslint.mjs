import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/components/landing/sections");
const re = /^\/\* eslint-disable[^\n]*\n/;
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".tsx")) continue;
  const p = path.join(dir, f);
  let s = fs.readFileSync(p, "utf8");
  if (re.test(s)) fs.writeFileSync(p, s.replace(re, ""), "utf8");
}
