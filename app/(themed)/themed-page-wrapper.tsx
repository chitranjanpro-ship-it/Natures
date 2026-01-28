import { ReactNode } from "react"
import { PageBackground } from "@/components/page-background"
import { getPageBackground } from "@/lib/backgrounds"

type Props = {
  pageKey: string
  children: ReactNode
}

export async function ThemedPage({ pageKey, children }: Props) {
  const config = await getPageBackground(pageKey)
  return (
    <>
      <PageBackground config={config} pageKey={pageKey} />
      {children}
    </>
  )
}

