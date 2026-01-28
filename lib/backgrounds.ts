import prisma from "./db"

export type PageBackgroundConfig = {
  mode: "solid" | "gradient" | "image" | "mixed" | "aurora" | "webgl" | "mesh" | "particles" | "waves" | "animated" | "none"
  solidColor?: string
  gradientFrom?: string
  gradientTo?: string
  overlayColor?: string
  overlayOpacity?: number
  rotationEnabled: boolean
  rotationInterval?: number
  colorShuffle: boolean
  colorShuffleInterval: number // Milliseconds
  colorIntensity: number // 0-2
  colorOpacity: number // 0-1
  imageShuffle: boolean
  enableModeShuffle: boolean
  images: { url: string; alt?: string; order: number }[]
  uiTheme?: string
  
  // New UI Effects
  videoUrl?: string
  videoFallbackImage?: string
  enableParallax: boolean
  enableGlassmorphism: boolean
  enableNeon: boolean
  enableAnimations: boolean
  animationIntensity: "low" | "medium" | "high"
  disableMobileEffects: boolean
  reduceMotion: boolean
  customColors?: string[]
}

export async function getPageBackground(pageKey: string): Promise<PageBackgroundConfig | null> {
  type RawBackground = {
    mode: string
    solidColor: string | null
    gradientFrom: string | null
    gradientTo: string | null
    overlayColor: string | null
    overlayOpacity: number | null
    rotationEnabled: boolean
    rotationInterval: number | null
    colorShuffle: boolean
    colorShuffleInterval: number | null
    colorIntensity: number | null
    colorOpacity: number | null
    imageShuffle: boolean
    enableModeShuffle: boolean
    customColors: string | null
    images: { url: string; alt: string | null; order: number }[]
    uiTheme: string | null
    videoUrl: string | null
    enableParallax: boolean
    enableGlassmorphism: boolean
    enableNeon: boolean
    enableAnimations: boolean
    animationIntensity: string
    disableMobileEffects: boolean
    reduceMotion: boolean
    videoFallbackImage: string | null
    waveStyle: string | null
    waveColorPreset: string | null
    waveSpeed: string | null
    bubbleDensity: string | null
    bubbleSpeed: string | null
    bubbleColorMode: string | null
  }

  const bg = (await prisma.pageBackground.findUnique({
    where: { pageKey },
    include: { images: { orderBy: { order: "asc" } } },
  })) as RawBackground | null

  if (!bg) return null

  // Inheritance Logic: If mode is "none" and not layout, fetch layout config
  if (bg.mode === "none" && pageKey !== "layout") {
    const layoutBg = await getPageBackground("layout")
    if (layoutBg) {
      // We return layout config but preserve the current page's images if needed?
      // User said "apply the theme engine globaly". 
      // Usually global theme replaces background style.
      // We will return layout config fully for the style parts.
      return {
        ...layoutBg,
        // Optional: Keep page-specific images if they exist? 
        // If mode is "none", usually it means "Use Global Background".
        // So if Global is Video, use Video. If Global is Image, use Global Images.
        // If we want to allow "Global Style + Local Images", that's "Mixed" mode or similar.
        // "None" implies full reset/inheritance.
      }
    }
  }

  return {
    mode: (bg.mode as PageBackgroundConfig["mode"]) ?? "gradient",
    solidColor: bg.solidColor ?? undefined,
    gradientFrom: bg.gradientFrom ?? undefined,
    gradientTo: bg.gradientTo ?? undefined,
    overlayColor: bg.overlayColor ?? undefined,
    overlayOpacity: bg.overlayOpacity ?? undefined,
    rotationEnabled: bg.rotationEnabled,
    rotationInterval: bg.rotationInterval ?? undefined,
    colorShuffle: bg.colorShuffle,
    colorShuffleInterval: bg.colorShuffleInterval ?? 5000,
    colorIntensity: bg.colorIntensity ?? 1,
    colorOpacity: bg.colorOpacity ?? 1,
    imageShuffle: bg.imageShuffle,
    enableModeShuffle: bg.enableModeShuffle,
    customColors: bg.customColors ? JSON.parse(bg.customColors) : [],
    images: bg.images.map((i: { url: string; alt: string | null; order: number }) => ({
      url: i.url,
      alt: i.alt ?? undefined,
      order: i.order,
    })),
    uiTheme: bg.uiTheme ?? undefined,
    videoUrl: bg.videoUrl ?? undefined,
    videoFallbackImage: bg.videoFallbackImage ?? undefined,
    enableParallax: bg.enableParallax,
    enableGlassmorphism: bg.enableGlassmorphism,
    enableNeon: bg.enableNeon,
    enableAnimations: bg.enableAnimations,
    animationIntensity: (bg.animationIntensity as PageBackgroundConfig["animationIntensity"]) ?? "medium",
    disableMobileEffects: bg.disableMobileEffects,
    reduceMotion: bg.reduceMotion,
  }
}
