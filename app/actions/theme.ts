"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function setGlobalTheme(theme: string) {
  await prisma.pageBackground.upsert({
    where: { pageKey: "layout" },
    update: { uiTheme: theme },
    create: {
      pageKey: "layout",
      mode: "gradient", // default fallback
      uiTheme: theme,
      rotationEnabled: false,
      colorShuffle: false,
      imageShuffle: false
    }
  })
  revalidatePath("/")
}
