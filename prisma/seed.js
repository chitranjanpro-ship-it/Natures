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

  const pageContents = [
    {
      slug: "awareness",
      title: "Awareness Programs",
      content: `
        <div class="prose max-w-none">
          <p>Our awareness programs focus on educating communities about environmental sustainability, hygiene, and social responsibility.</p>
          <ul>
            <li>Environmental Protection</li>
            <li>Health & Hygiene Workshops</li>
            <li>Community Engagement</li>
          </ul>
        </div>
      `
    },
    {
      slug: "training",
      title: "Training & Development",
      content: `
        <div class="prose max-w-none">
          <p>We provide skill development training for women, youth, and volunteers to empower them for a better future.</p>
          <ul>
            <li>Vocational Training</li>
            <li>Skill Development Workshops</li>
            <li>Volunteer Leadership Programs</li>
          </ul>
        </div>
      `
    },
    {
      slug: "research",
      title: "Research & Innovation",
      content: `
        <div class="prose max-w-none">
          <p>Our research initiatives aim to bridge the gap between urban and rural needs through evidence-based projects.</p>
          <ul>
            <li>Urban-Rural Studies</li>
            <li>Environmental Impact Assessment</li>
            <li>Social Sustainability Research</li>
          </ul>
        </div>
      `
    }
  ]

  console.log('Seeding page content...')
  for (const page of pageContents) {
    await prisma.pageContent.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    })
  }
  console.log('Page content seeded.')

  // Create Admin User
  const adminEmail = "admin@nature.com"
  const adminPassword = await hash("admin123", 10)
  
  const adminRole = await prisma.role.findUnique({
    where: { name: "SUPER_ADMIN" }
  })

  if (adminRole) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        roleId: adminRole.id,
      },
      create: {
        email: adminEmail,
        name: "Super Admin",
        password: adminPassword,
        roleId: adminRole.id,
      },
    })
    console.log(`Admin user seeded: ${adminEmail} / admin123`)
  }
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
