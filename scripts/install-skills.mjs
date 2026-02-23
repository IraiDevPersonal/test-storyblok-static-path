import fs from "fs";
import { execSync } from "child_process";

const LOCK_FILE = "skills-lock.json";

if (!fs.existsSync(LOCK_FILE)) {
  console.error("❌ No se encontró skills-lock.json");
  process.exit(1);
}

const lock = JSON.parse(fs.readFileSync(LOCK_FILE, "utf-8"));

if (!lock.skills) {
  console.error("❌ El lockfile no tiene la propiedad 'skills'");
  process.exit(1);
}

console.log("🚀 Instalando skills con pnpx...\n");

for (const [skillName, config] of Object.entries(lock.skills)) {
  if (!config.source) continue;

  const repoUrl = `https://github.com/${config.source}`;
  const command = `pnpx skills add ${repoUrl} --skill ${skillName}`;

  try {
    console.log(`⬇ Instalando ${skillName}...`);
    execSync(command, { stdio: "inherit" });
    console.log(`✔ ${skillName} instalada\n`);
  } catch (error) {
    console.error(`❌ Error instalando ${skillName}\n`);
  }
}

console.log("✅ Instalación completada");