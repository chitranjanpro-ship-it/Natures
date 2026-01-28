import prisma from "@/lib/db"
import { ThemedPage } from "../(themed)/themed-page-wrapper"
import { notFound } from "next/navigation"

export default async function AwarenessPage() {
  const page = await prisma.pageContent.findUnique({
    where: { slug: "awareness" }
  })

  if (!page) return notFound()

  return (
    <ThemedPage pageKey="home">
      <div className="container max-w-screen-xl py-10 px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
      </div>
    </ThemedPage>
  )
}
