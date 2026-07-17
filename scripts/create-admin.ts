import { PrismaClient } from "@prisma/client";
import {
  hashPassword,
  isStrongAdminPassword,
} from "../src/lib/admin-auth";

const prisma = new PrismaClient();

function readArg(flag: string): string | null {
  const index = process.argv.indexOf(flag);
  if (index === -1) return null;
  const value = process.argv[index + 1]?.trim();
  return value && value.length > 0 ? value : null;
}

async function main() {
  const email = (readArg("--email") ?? process.env.ADMIN_EMAIL ?? "services@noyaindustries.com").toLowerCase();
  const name = readArg("--name") ?? process.env.ADMIN_NAME ?? "Administrateur Noya";
  const password = readArg("--password") ?? process.env.ADMIN_PASSWORD?.trim();

  if (!password || !isStrongAdminPassword(password)) {
    throw new Error(
      "Mot de passe requis : 12 caractères minimum avec majuscule, minuscule, chiffre et symbole.",
    );
  }

  const passwordHash = await hashPassword(password);
  const existing = await prisma.adminUser.findUnique({ where: { email } });

  if (existing) {
    await prisma.adminUser.update({
      where: { email },
      data: { name, passwordHash },
    });
    console.log(`Admin mis à jour : ${email}`);
    return;
  }

  await prisma.adminUser.create({
    data: { email, name, passwordHash },
  });
  console.log(`Admin créé : ${email}`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await prisma.$disconnect();
    process.exit(1);
  });
