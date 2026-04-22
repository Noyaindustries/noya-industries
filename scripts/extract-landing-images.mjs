import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const sections = path.join(root, "src/components/landing/sections");

function parseDataUri(uri) {
  const m = uri.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!m) return null;
  return { declaredMime: m[1], buffer: Buffer.from(m[2], "base64") };
}

function extFromMagic(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)
    return "png";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "gif";
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50)
    return "webp";
  return "bin";
}

const files = ["NoyaLandingNav.tsx", "NoyaLandingFooter.tsx"];
const outDir = path.join(root, "public/landing");
fs.mkdirSync(outDir, { recursive: true });

const seen = new Map(); // hash -> public path

for (const name of files) {
  const p = path.join(sections, name);
  let s = fs.readFileSync(p, "utf8");
  const re = /src="(data:image\/[^"]+)"/;
  const m = s.match(re);
  if (!m) {
    console.warn("no data uri in", name);
    continue;
  }
  const parsed = parseDataUri(m[1]);
  if (!parsed) throw new Error(`bad uri in ${name}`);
  const ext = extFromMagic(parsed.buffer);
  const hash = crypto.createHash("sha256").update(parsed.buffer).digest("hex").slice(0, 16);
  let rel;
  if (seen.has(hash)) {
    rel = seen.get(hash);
    console.log(name, "-> dedupe", rel);
  } else {
    const fname = `noya-brand-mark.${ext}`;
    const full = path.join(outDir, fname);
    fs.writeFileSync(full, parsed.buffer);
    rel = `/landing/${fname}`;
    seen.set(hash, rel);
    console.log(name, "-> wrote", full, parsed.buffer.length, "bytes", ext);
  }
}
