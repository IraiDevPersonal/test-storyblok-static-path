import fs from "fs";
import { execSync } from "child_process";

const LOCK_FILE = "skills-lock.json";

function run(command) {
  return execSync(command, { encoding: "utf-8" });
}

if (!fs.existsSync(LOCK_FILE)) {
  console.error("❌ No se encontró skills-lock.json");
  process.exit(1);
}

const lock = JSON.parse(fs.readFileSync(LOCK_FILE, "utf-8"));
const requiredSkills = Object.keys(lock.skills);

console.log("🔎 Obteniendo skills instaladas...\n");

let installedSkills = [];

try {
  const output = run("pnpx skills list --json");
  const parsed = JSON.parse(output);
  installedSkills = parsed.map(s => s.name);
} catch {
  console.log("⚠ No se pudieron obtener skills instaladas. Se asumirá ninguna instalada.\n");
}

const missingSkills = requiredSkills.filter(
  skill => !installedSkills.includes(skill)
);

if (missingSkills.length === 0) {
  console.log("✅ Todas las skills están sincronizadas");
  process.exit(0);
}

console.log("🚀 Instalando skills faltantes...\n");

for (const skillName of missingSkills) {
  const config = lock.skills[skillName];
  const repoUrl = `https://github.com/${config.source}`;
  const command = `pnpx skills add ${repoUrl} --skill ${skillName}`;

  try {
    console.log(`⬇ Instalando ${skillName}...`);
    execSync(command, { stdio: "inherit" });
    console.log(`✔ ${skillName} instalada\n`);
  } catch {
    console.error(`❌ Error instalando ${skillName}\n`);
  }
}

console.log("✅ Sincronización completada");