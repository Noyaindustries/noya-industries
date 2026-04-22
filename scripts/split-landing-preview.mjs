import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceTs =
  process.argv[2] ?? path.join(root, "src/content/noya-landing-body.ts");
if (!fs.existsSync(sourceTs)) {
  console.error("Usage: node scripts/split-landing-preview.mjs <noya-landing-body.ts>");
  process.exit(1);
}
const s = fs.readFileSync(sourceTs, "utf8");
const eq = s.indexOf("=");
const rhs = s.slice(eq + 1).trim().replace(/;\s*$/, "").trim();
const html = JSON.parse(rhs);

const re = /<!--\s*═+\s*([^═]+?)\s*═+\s*-->/g;
let m;
const titles = [];
while ((m = re.exec(html)) !== null) titles.push(m[1].trim());
console.log("sections:", titles.length, titles.join(" | "));

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]);
const uniq = [...new Set(ids)];
console.log("ids:", uniq.join(", "));
