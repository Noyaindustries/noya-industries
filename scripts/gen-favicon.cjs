/* Génère src/app/favicon.ico + copie apple-icon depuis le logo landing.
 * Commande : npm run gen:favicon (sharp + to-ico en devDependencies)
 */
const sharp = require("sharp");
const toIco = require("to-ico");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const input = path.join(root, "public", "landing", "noya-brand-mark.jpg");
const output = path.join(root, "src", "app", "favicon.ico");

/** Fond `--cobalt` (noya-artifact.css) : le JPG a beaucoup de blanc, invisible sur onglet clair sans fond. */
const TAB_BG = "#153D72";

(async () => {
  const bufs = await Promise.all(
    [16, 32, 48].map((s) =>
      sharp(input)
        .resize(s, s, {
          fit: "contain",
          position: "centre",
          background: TAB_BG,
        })
        .flatten({ background: TAB_BG })
        .png()
        .toBuffer(),
    ),
  );
  const ico = await toIco(bufs);
  fs.writeFileSync(output, ico);
  console.log("Wrote", output, "(" + ico.length + " bytes)");

  const appleOut = path.join(root, "src", "app", "apple-icon.jpg");
  fs.copyFileSync(input, appleOut);
  console.log("Copied apple touch source →", appleOut);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
