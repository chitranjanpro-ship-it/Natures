import prisma from "@/lib/db"
import { ThemedPage } from "../(themed)/themed-page-wrapper"

export default async function AwarenessPage() {
  const page = await prisma.pageContent.findUnique({
    where: { slug: "awareness" }
  })

  if (!page) {
    return (
      <ThemedPage pageKey="home">
        <div className="container max-w-screen-xl py-10 px-4 md:px-6">
          <h1 className="text-3xl font-bold mb-6">Awareness Programs</h1>
          <div className="prose max-w-none">
            <p>Our awareness programs focus on educating communities about environmental sustainability, hygiene, and social responsibility.</p>
            <ul>
              <li>Environmental Protection</li>
              <li>Health & Hygiene Workshops</li>
              <li>Community Engagement</li>
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
