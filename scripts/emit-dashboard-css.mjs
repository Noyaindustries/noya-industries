/**
 * Le dashboard utilise désormais `src/app/dashboard/dashboard.css` (version premium),
 * éditée directement. Ce script ne réécrit plus le fichier pour éviter d’écraser le design.
 */
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const cssPath = path.join(root, "src/app/dashboard/dashboard.css");
console.log("Dashboard CSS (premium) :", cssPath);
console.log("Modifier ce fichier à la main — génération automatique désactivée.");
process.exit(0);
