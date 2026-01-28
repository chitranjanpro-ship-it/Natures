import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { requireRole } from "@/lib/roles"
import { logAudit } from "@/lib/audit"
import { UiEffectsControls } from "@/components/admin/ui-effects-controls"
import { getPageBackground } from "@/lib/backgrounds"
import { PageBackgroundForm } from "@/components/admin/page-background-form"

async function updateBackground(formData: FormData) {
  "use server"

  await requireRole(["Admin", "Manager"], "manage_backgrounds")

  const id = formData.get("id")?.toString() ?? ""
  if (!id) return

  const mode = formData.get("mode")?.toString() || "gradient"
  const solidColorRaw = formData.get("solidColor")?.toString().trim()
  const gradientFromRaw = formData.get("gradientFrom")?.toString().trim()
  const gradientToRaw = formData.get("gradientTo")?.toString().trim()
  const overlayColorRaw = formData.get("overlayColor")?.toString().trim()

  const solidColor = solidColorRaw || null
  const gradientFrom = gradientFromRaw || null
  const gradientTo = gradientToRaw || null
  const overlayColor = overlayColorRaw || null

  const overlayOpacityRaw = formData.get("overlayOpacity")?.toString().trim()
  let overlayOpacity: number | null = null
  if (overlayOpacityRaw) {
    const parsed = Number(overlayOpacityRaw)
    if (!Number.isNaN(parsed)) {
      overlayOpacity = Math.max(0, Math.min(1, parsed))
    }
  }

  const rotationEnabled = formData.get("rotationEnabled") === "on"
  const colorShuffle = formData.get("colorShuffle") === "on"
  const imageShuffle = formData.get("imageShuffle") === "on"
  
  const rotationIntervalRaw = formData.get("rotationInterval")?.toString().trim()
  let rotationInterval: number | null = null
  if (rotationIntervalRaw) {
    const parsed = Number(rotationIntervalRaw)
    if (!Number.isNaN(parsed) && parsed > 0) {
      rotationInterval = Math.round(parsed)
    }
  }

  // New Fields
  const colorShuffleIntervalRaw = formData.get("colorShuffleInterval")?.toString().trim()
  let colorShuffleInterval: number | null = null
  if (colorShuffleIntervalRaw) {
      const parsed = Number(colorShuffleIntervalRaw)
      if (!Number.isNaN(parsed) && parsed > 0) colorShuffleInterval = Math.round(parsed)
  }

  const colorIntensityRaw = formData.get("colorIntensity")?.toString().trim()
  let colorIntensity: number | null = null
  if (colorIntensityRaw) {
      const parsed = Number(colorIntensityRaw)
      if (!Number.isNaN(parsed)) colorIntensity = parsed
  }

  const colorOpacityRaw = formData.get("colorOpacity")?.toString().trim()
  let colorOpacity: number | null = null
  if (colorOpacityRaw) {
      const parsed = Number(colorOpacityRaw)
      if (!Number.isNaN(parsed)) colorOpacity = parsed
  }

  const customColorsRaw = formData.get("customColors")?.toString().trim()
  // Ensure it's valid JSON, or default to null
  let customColors = null
  if (customColorsRaw) {
      try {
          JSON.parse(customColorsRaw) // Validate
          customColors = customColorsRaw
      } catch (e) {
          customColors = null
      }
  }

  const image1UrlRaw = formData.get("image1Url")?.toString().trim()
  const image1AltRaw = formData.get("image1Alt")?.toString().trim()
  const image2UrlRaw = formData.get("image2Url")?.toString().trim()
  const image2AltRaw = formData.get("image2Alt")?.toString().trim()

  await prisma.$transaction(async (tx) => {
    await (tx as typeof prisma).pageBackground.update({
      where: { id },
      data: {
        mode,
        solidColor,
        gradientFrom,
        gradientTo,
        overlayColor,
        overlayOpacity,
        rotationEnabled,
        rotationInterval,
        colorShuffle,
        imageShuffle,
        // New Fields
        colorShuffleInterval,
        colorIntensity,
        colorOpacity,
        customColors
      },
    })

    await (tx as typeof prisma).backgroundImage.deleteMany({ where: { pageBackgroundId: id } })

    const images: { url: string; alt: string | null; order: number; pageBackgroundId: string }[] = []

    if (image1UrlRaw) {
      images.push({
        url: image1UrlRaw,
        alt: image1AltRaw || null,
        order: 0,
        pageBackgroundId: id,
      })
    }

    if (image2UrlRaw) {
      images.push({
        url: image2UrlRaw,
        alt: image2AltRaw || null,
        order: 1,
        pageBackgroundId: id,
      })
    }

    if (images.length > 0) {
      await (tx as typeof prisma).backgroundImage.createMany({ data: images })
    }
  })

  await logAudit({
    userId: null,
    route: "/admin/backgrounds",
    method: "POST",
    status: 200,
    ip: null,
    details: "update",
  })

  redirect("/admin/backgrounds")
}

async function resetBackground(formData: FormData) {
  "use server"

  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "manage_backgrounds")

  const id = formData.get("id")?.toString() ?? ""
  if (!id) return

  // Updated Reset Logic: Reset to "None" (Inherit Global)
  await prisma.pageBackground.update({
      where: { id },
      data: {
        mode: "none", // This triggers inheritance in getPageBackground
        solidColor: null,
        gradientFrom: null,
        gradientTo: null,
        overlayColor: null,
        overlayOpacity: null,
        rotationEnabled: false,
        rotationInterval: null,
        colorShuffle: false,
        imageShuffle: false,
        colorShuffleInterval: 5000,
        colorIntensity: 1,
        colorOpacity: 1,
        customColors: null
      },
    })

  await logAudit({
    userId: null,
    route: "/admin/backgrounds",
    method: "POST",
    status: 200,
    ip: null,
    details: "reset",
  })

  redirect("/admin/backgrounds")
}

export default async function BackgroundsAdminPage() {
  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "manage_backgrounds")

  type BackgroundWithImages = {
    id: string
    pageKey: string
    mode: string
    solidColor: string | null
    gradientFrom: string | null
    gradientTo: string | null
    overlayColor: string | null
    overlayOpacity: number | null
    rotationEnabled: boolean
    rotationInterval: number | null
    colorShuffle: boolean
    imageShuffle: boolean
    colorShuffleInterval: number | null
    colorIntensity: number | null
    colorOpacity: number | null
    customColors: string | null
    images: { url: string; alt: string | null; order: number }[]
  }

  const backgrounds = (await prisma.pageBackground.findMany({
    orderBy: { pageKey: "asc" },
    include: { images: { orderBy: { order: "asc" } } },
  })) as BackgroundWithImages[]

  const layoutBackground = await getPageBackground("layout")

  return (
    <main className="container max-w-screen-xl py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Page Backgrounds</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Admin-only view of all configured page backgrounds. Use the form below to update each page.
      </p>

      {/* Global Controls Section */}
      <section className="mb-12">
        <UiEffectsControls initialConfig={layoutBackground} />
      </section>

      <div className="space-y-6">
        {backgrounds.map((bg: BackgroundWithImages) => {
          // Helper to determine preview URL based on pageKey
          let previewUrl = "/"
          if (bg.pageKey !== "home" && bg.pageKey !== "layout") {
             previewUrl = `/${bg.pageKey}`
          }

          return (
            <section key={bg.id} className="rounded-lg border bg-white/80 dark:bg-black/40 backdrop-blur-md p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold capitalize">{bg.pageKey.replace("-", " ")} Page</h2>
                  <p className="text-xs text-muted-foreground">Configure background for {bg.pageKey}</p>
                </div>
                <div className="flex gap-2">
                  <a 
                    href={`${previewUrl}?preview=true`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
                  >
                    Preview {bg.pageKey}
                  </a>
                  <form action={resetBackground}>
                    <input type="hidden" name="id" value={bg.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-md border border-input px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 h-8"
                    >
                      Reset to Global
                    </button>
                  </form>
                </div>
              </div>

              {/* Use the new Client Component Form */}
              <PageBackgroundForm background={bg} updateAction={updateBackground} />
              
              {bg.images.length > 0 && (
                <div className="mt-4 space-y-2 border-t pt-4">
                  <p className="text-xs font-medium text-muted-foreground">Current Image Library for this Page</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {bg.images.map((img) => (
                      <figure key={`${img.url}-${img.order}`} className="overflow-hidden rounded-md border group relative">
                        <div className="relative aspect-video bg-muted">
                          <img
                            src={img.url}
                            alt={img.alt ?? "Background image"}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <figcaption className="flex items-center justify-between px-2 py-1 text-[11px] text-muted-foreground">
                          <span className="truncate">{img.alt ?? "No alt"}</span>
                          <span className="font-mono">#{img.order}</span>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )
        })}
      </div>
    </main>
  )
}
