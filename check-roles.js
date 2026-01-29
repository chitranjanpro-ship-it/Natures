/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany();
  console.log("Existing roles:", roles.map(r => r.name));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
