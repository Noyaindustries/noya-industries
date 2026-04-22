import fs from "fs";

const p =
  "C:/Users/UTILISATEUR/.cursor/projects/f-noya-industries/agent-transcripts/d7ed6a6d-13d3-41ee-97e3-4f438e45261d/d7ed6a6d-13d3-41ee-97e3-4f438e45261d.jsonl";
const line = fs
  .readFileSync(p, "utf8")
  .split("\n")
  .find((l) => l.includes("hero-kicker"));
if (!line) throw new Error("line not found");
const o = JSON.parse(line);
const t = o.message.content[0].text;
const bi = t.indexOf("<body>");
const bj = t.indexOf("<script>");
let html = t.slice(bi + 6, bj).trim();
fs.writeFileSync(new URL("../scripts/tmp-extracted-body.txt", import.meta.url), html);
console.log("body bytes", html.length);
