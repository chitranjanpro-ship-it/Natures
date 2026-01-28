
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const domains = [
    {
      title: "Social Welfare",
      description: "Community outreach, support for underprivileged, and social services."
    },
    {
      title: "Environmental Protection",
      description: "Conservation projects, tree plantation, and waste management initiatives."
    },
    {
      title: "Child Rights & Education",
      description: "Teaching, curriculum development, and advocacy for child rights."
    },
    {
      title: "Healthcare & Nutrition",
      description: "Health camps, nutrition programs, and public health awareness."
    },
    {
      title: "Women Empowerment",
      description: "Skill development, legal awareness, and support groups for women."
    },
    {
      title: "Rural Development",
      description: "Infrastructure, agriculture support, and livelihood generation in rural areas."
    },
    {
      title: "Disaster Management",
      description: "Relief work, preparedness training, and emergency response."
    },
    {
      title: "Human Rights",
      description: "Advocacy, legal aid, and awareness campaigns for human rights."
    },
    {
      title: "Fundraising & Grant Writing",
      description: "Resource mobilization, proposal writing, and donor relations."
    },
    {
      title: "NGO Management & Administration",
      description: "Operations, project coordination, and organizational management."
    },
    {
      title: "Web Development & IT",
      description: "Website maintenance, digital tools, and IT support for the organization."
    },
    {
      title: "Research & Analysis",
      description: "Field research, data collection, and impact assessment."
    }
  ]

  console.log('Start seeding internship domains...')

  for (const domain of domains) {
    const existing = await prisma.internshipDomain.findFirst({
      where: { title: domain.title }
    })

    if (!existing) {
      await prisma.internshipDomain.create({
        data: {
          title: domain.title,
          description: domain.description,
          isActive: true
        }
      })
      console.log(`Created domain: ${domain.title}`)
    } else {
      console.log(`Domain already exists: ${domain.title}`)
    }
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
