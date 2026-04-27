import fs from "fs";
import HTMLtoJSX from "htmltojsx";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const sourceTs =
  process.argv[2] ?? path.join(root, "src/content/noya-landing-body.ts");
if (!fs.existsSync(sourceTs)) {
  console.error(
    "Fichier source introuvable :",
    sourceTs,
    "\nUsage: node scripts/generate-landing-tsx.mjs <chemin/noya-landing-body.ts>",
    "\n(Bootstrap : export `noyaLandingBodyHtml = JSON.stringify(html)` du corps landing.)",
  );
  process.exit(1);
}
const srcBody = fs.readFileSync(sourceTs, "utf8");
const eq = srcBody.indexOf("=");
const rhs = srcBody.slice(eq + 1).trim().replace(/;\s*$/, "").trim();
const html = JSON.parse(rhs);

const rawParts = html.split(/<!--\s*═+\s*[^═]+?\s*═+\s*-->/);

/** @type {{ key: string; fragment: string }[]} */
const sections = [];
sections.push({ key: "Background", fragment: rawParts[0].trim() });

const markers = [...html.matchAll(/<!--\s*═+\s*([^═]+?)\s*═+\s*-->/g)];
for (let i = 0; i < markers.length; i++) {
  const title = markers[i][1].trim();
  sections.push({ key: title, fragment: rawParts[i + 1]?.trim() ?? "" });
}

const nameMap = {
  Background: "NoyaLandingBackground",
  NAV: "NoyaLandingNav",
  HERO: "NoyaLandingHero",
  PROOF: "NoyaLandingProof",
  STORY: "NoyaLandingStory",
  STATS: "NoyaLandingStats",
  POLES: "NoyaLandingPoles",
  PRODUCTS: "NoyaLandingProducts",
  "EXPERTISE BLOG": "NoyaLandingBlog",
  TEAM: "NoyaLandingTeam",
  PARTNERS: "NoyaLandingPartners",
  CONTACT: "NoyaLandingContact",
  "CTA FINAL": "NoyaLandingCtaFinal",
  FOOTER: "NoyaLandingFooter",
};

const converter = new HTMLtoJSX({ createClass: false });

const outDir = path.join(root, "src/components/landing/sections");
fs.mkdirSync(outDir, { recursive: true });

for (const { key, fragment } of sections) {
  const comp = nameMap[key];
  if (!comp) throw new Error(`Unknown section key: ${key}`);
  if (!fragment) {
    console.warn("Empty fragment for", key);
    continue;
  }
  let jsxBody;
  try {
    jsxBody = converter.convert(fragment.trim());
  } catch (e) {
    console.error("convert failed", key, e);
    process.exit(1);
  }
  const file = path.join(outDir, `${comp}.tsx`);
  const content = `export function ${comp}() {\n  return (\n    <>\n${indentBlock(jsxBody, 6)}\n    </>\n  );\n}\n`;
  fs.writeFileSync(file, content, "utf8");
  console.log("wrote", path.relative(root, file), fragment.length);
}

const imports = sections
  .map(({ key }) => nameMap[key])
  .filter(Boolean)
  .map((n) => `import { ${n} } from "./sections/${n}";`)
  .join("\n");

const body = sections
  .map(({ key }) => {
    const n = nameMap[key];
    return n ? `      <${n} />` : "";
  })
  .filter(Boolean)
  .join("\n");

const indexPath = path.join(root, "src/components/landing/NoyaLandingBody.tsx");
fs.writeFileSync(
  indexPath,
  `${imports}\n\nexport function NoyaLandingBody() {\n  return (\n    <>\n${body}\n    </>\n  );\n}\n`,
  "utf8",
);
console.log("wrote", path.relative(root, indexPath));

function indentBlock(s, spaces) {
  const pad = " ".repeat(spaces);
  return s
    .split("\n")
    .map((line) => (line.trim() ? pad + line : ""))
    .join("\n");
}
