import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const sections = path.join(root, "src/components/landing/sections");
const importLine = 'import { LANDING_IMG } from "../landingAssets";\n';

for (const name of ["NoyaLandingNav.tsx", "NoyaLandingFooter.tsx"]) {
  const p = path.join(sections, name);
  let s = fs.readFileSync(p, "utf8");
  const next = s.replace(/src="data:image\/[^"]+"/g, "src={LANDING_IMG.brandMark}");
  if (next === s) throw new Error(`No replacement in ${name}`);
  if (!s.includes("landingAssets")) {
    s = importLine + next;
  } else {
    s = next;
  }
  fs.writeFileSync(p, s, "utf8");
  console.log("patched", name, "len", s.length);
}
