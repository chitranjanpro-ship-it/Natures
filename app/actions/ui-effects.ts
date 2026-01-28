"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { PageBackgroundConfig } from "@/lib/backgrounds"

export async function updateUiEffects(settings: Partial<PageBackgroundConfig>) {
  // We only update the global "layout" configuration
  await prisma.pageBackground.upsert({
    where: { pageKey: "layout" },
    update: {
      mode: settings.mode,
      videoUrl: settings.videoUrl,
      enableParallax: settings.enableParallax,
      enableGlassmorphism: settings.enableGlassmorphism,
      enableNeon: settings.enableNeon,
      enableAnimations: settings.enableAnimations,
      animationIntensity: settings.animationIntensity,
      disableMobileEffects: settings.disableMobileEffects,
      reduceMotion: settings.reduceMotion,
      // Persist other mode settings if passed, but usually handled by specific editors
      ...(settings.solidColor && { solidColor: settings.solidColor }),
      ...(settings.gradientFrom && { gradientFrom: settings.gradientFrom }),
      ...(settings.gradientTo && { gradientTo: settings.gradientTo }),
      enableModeShuffle: settings.enableModeShuffle,
      customColors: settings.customColors ? JSON.stringify(settings.customColors) : undefined,
    },
    create: {
      pageKey: "layout",
      mode: settings.mode || "gradient",
      uiTheme: "nature",
      videoUrl: settings.videoUrl,
      videoFallbackImage: settings.videoFallbackImage,
      enableParallax: settings.enableParallax ?? true,
      enableGlassmorphism: settings.enableGlassmorphism ?? true,
      enableNeon: settings.enableNeon ?? false,
      enableAnimations: settings.enableAnimations ?? true,
      animationIntensity: settings.animationIntensity || "medium",
      disableMobileEffects: settings.disableMobileEffects ?? true,
      reduceMotion: settings.reduceMotion ?? false,
      enableModeShuffle: settings.enableModeShuffle ?? false,
      customColors: settings.customColors ? JSON.stringify(settings.customColors) : "[]",
    }
  })
  
  revalidatePath("/", "layout")
}
