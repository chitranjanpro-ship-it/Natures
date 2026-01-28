const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const roles = [
    "SYSTEM_ADMIN",
    "SUPER_ADMIN",
    "SOCIETY_ADMIN",
    "CHAIRMAN",
    "PRESIDENT",
    "SECRETARY",
    "TREASURER",
    "COMMITTEE_MEMBER",
    "GENERAL_MEMBER",
    "Admin",
    "User"
  ]

  console.log('Seeding roles...')
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    })
  }
  console.log('Roles seeded.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
