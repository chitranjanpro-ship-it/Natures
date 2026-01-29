import prisma from "@/lib/db"
import { ThemedPage } from "../(themed)/themed-page-wrapper"
import { notFound } from "next/navigation"

export default async function ResearchPage() {
  const page = await prisma.pageContent.findUnique({
    where: { slug: "research" }
  })

  if (!page) {
    return (
      <ThemedPage pageKey="home">
        <div className="container max-w-screen-xl py-10 px-4 md:px-6">
          <h1 className="text-3xl font-bold mb-6">Research & Innovation</h1>
          <div className="prose max-w-none">
            <p>Our research initiatives aim to bridge the gap between urban and rural needs through evidence-based projects.</p>
            <ul>
              <li>Urban-Rural Studies</li>
              <li>Environmental Impact Assessment</li>
              <li>Social Sustainability Research</li>
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
