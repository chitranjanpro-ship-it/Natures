import prisma from "@/lib/db"
import { ThemedPage } from "../(themed)/themed-page-wrapper"

export default async function TrainingPage() {
  const page = await prisma.pageContent.findUnique({
    where: { slug: "training" }
  })

  if (!page) {
    return (
      <ThemedPage pageKey="home">
        <div className="container max-w-screen-xl py-10 px-4 md:px-6">
          <h1 className="text-3xl font-bold mb-6">Training & Development</h1>
          <div className="prose max-w-none">
            <p>We provide skill development training for women, youth, and volunteers to empower them for a better future.</p>
            <ul>
              <li>Vocational Training</li>
              <li>Skill Development Workshops</li>
              <li>Volunteer Leadership Programs</li>
            </ul>
          </div>
        </div>
      </ThemedPage>
    )
  }

  return (
    <ThemedPage pageKey="home">
      <div className="container max-w-screen-xl py-10 px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
      </div>
    </ThemedPage>
  )
}
