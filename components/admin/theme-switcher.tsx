"use client"

import * as React from "react"
import { useTheme, Theme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { setGlobalTheme } from "@/app/actions/theme"

export function ThemeSwitcher({ globalDefaultTheme }: { globalDefaultTheme?: string }) {
  const { theme, setTheme } = useTheme()

  const handleThemeChange = async (newTheme: Theme) => {
    setTheme(newTheme)
    // Persist to server as global default
    await setGlobalTheme(newTheme)
  }

  const themes: { value: Theme; label: string; description: string }[] = [
    { value: "nature", label: "Nature", description: "Organic Forest & Moss" },
    { value: "glassmorphism", label: "Glassmorphism", description: "Obsidian & Neon Ice" },
    { value: "neo-brutalism", label: "Ethereal", description: "Mystical Void & Lilac" },
    { value: "data-driven", label: "Data Grid", description: "Cyber Navy & Cyan" },
    { value: "cinematic", label: "Cinematic", description: "Dark & Immersive" },
    { value: "luxury", label: "Luxury", description: "Midnight Gold & Premium" },
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Theme Engine</CardTitle>
        <CardDescription>
          Switch global design mode instantly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {themes.map((t) => (
                <Button 
                    key={t.value}
                    variant={theme === t.value ? "default" : "outline"}
                    className={`relative h-24 flex flex-col items-center justify-center gap-1 transition-all ${theme === t.value ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    onClick={() => handleThemeChange(t.value)}
                >
                    {globalDefaultTheme === t.value && (
                        <span className="absolute top-2 right-2 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">
                            DEFAULT
                        </span>
                    )}
                    <span className="font-bold text-lg">{t.label}</span>
                    <span className="text-xs opacity-70">{t.description}</span>
                    {theme === t.value && <span className="text-[10px] uppercase tracking-wider font-bold text-green-500 mt-1">Active</span>}
                </Button>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
