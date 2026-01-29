"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ImageInputWithPreview } from "@/components/admin/image-input-with-preview"
import { Sun, Volume2, Palette, Check, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { PageBackgroundConfig } from "@/lib/backgrounds"

const PRESET_COLORS = [
  { name: "Red", value: "0 100% 50%" },
  { name: "Orange", value: "30 100% 50%" },
  { name: "Yellow", value: "60 100% 50%" },
  { name: "Green", value: "120 100% 40%" },
  { name: "Emerald", value: "150 100% 40%" },
  { name: "Teal", value: "180 100% 40%" },
  { name: "Cyan", value: "195 100% 50%" },
  { name: "Sky", value: "210 100% 60%" },
  { name: "Blue", value: "240 100% 60%" },
  { name: "Indigo", value: "260 100% 65%" },
  { name: "Violet", value: "270 100% 65%" },
  { name: "Purple", value: "280 100% 50%" },
  { name: "Fuchsia", value: "300 100% 50%" },
  { name: "Pink", value: "330 100% 60%" },
  { name: "Rose", value: "350 100% 60%" },
  { name: "White", value: "0 0% 100%" },
  { name: "Gray", value: "0 0% 50%" },
  { name: "Black", value: "0 0% 0%" },
]

type Props = {
  background: Omit<PageBackgroundConfig, "customColors"> & { 
    id: string; 
    pageKey: string;
    customColors: string | null; 
    images: { url: string; alt?: string | null; order: number }[] 
  }
  updateAction: (formData: FormData) => Promise<void>
}

export function PageBackgroundForm({ background: bg, updateAction }: Props) {
  const [colorShuffleInterval, setColorShuffleInterval] = useState(bg.colorShuffleInterval || 5000)
  const [colorIntensity, setColorIntensity] = useState(bg.colorIntensity || 1)
  const [colorOpacity, setColorOpacity] = useState(bg.colorOpacity || 1)
  const [customColors, setCustomColors] = useState<string[]>(
    bg.customColors ? JSON.parse(bg.customColors) : []
  )
  const [mode, setMode] = useState(bg.mode)

  const toggleCustomColor = (colorValue: string) => {
    if (customColors.includes(colorValue)) {
      setCustomColors(prev => prev.filter(c => c !== colorValue))
    } else {
      setCustomColors(prev => [...prev, colorValue])
    }
  }

  const image1 = bg.images[0]
  const image2 = bg.images[1]

  return (
    <form action={updateAction} className="space-y-6">
      <input type="hidden" name="id" value={bg.id} />
      <input type="hidden" name="customColors" value={JSON.stringify(customColors)} />
      
      {/* Mode Selection */}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Background Mode</span>
          <select
            name="mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as PageBackgroundConfig["mode"])}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="none">None (Use Global Theme)</option>
            <option value="solid">Solid Color</option>
            <option value="gradient">Gradient</option>
            <option value="image">Image</option>
            <option value="mixed">Mixed</option>
            <option value="mesh">Mesh Gradient</option>
            <option value="particles">Particles</option>
            <option value="waves">Waves</option>
            <option value="animated">Animated Gradient</option>
            <option value="aurora">Aurora</option>
            <option value="webgl">WebGL (experimental)</option>
          </select>
        </label>

        {mode === "none" && (
            <div className="flex items-center text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                This page will inherit settings from Global Mode.
            </div>
        )}
      </div>

      {mode !== "none" && (
        <>
            {/* Color Palette & Custom Colors */}
            <div className="space-y-3 border rounded-md p-4 bg-muted/20">
                <Label className="flex items-center gap-2">
                    <Palette className="h-4 w-4" /> Color Palette & Shuffle Selection
                </Label>
                <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => {
                        const isSelected = customColors.includes(color.value)
                        return (
                            <button
                                key={color.value}
                                type="button"
                                onClick={() => toggleCustomColor(color.value)}
                                className={cn(
                                    "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center",
                                    isSelected ? "border-primary scale-110 shadow-md" : "border-transparent hover:scale-105"
                                )}
                                style={{ backgroundColor: `hsl(${color.value})` }}
                                title={color.name}
                            >
                                {isSelected && <Check className="h-4 w-4 text-white drop-shadow-md" />}
                            </button>
                        )
                    })}
                </div>
                <p className="text-xs text-muted-foreground">
                    Select multiple colors to use with &quot;Shuffle Colors&quot;. If no colors are selected, it will use random hue rotation.
                </p>
            </div>

            {/* Sliders: Interval, Intensity, Opacity */}
            <div className="grid gap-6 md:grid-cols-3 border rounded-md p-4">
                {/* Interval */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium flex items-center gap-2">
                            <RefreshCw className="h-3 w-3" /> Shuffle Interval
                        </Label>
                        <span className="text-xs text-muted-foreground">{colorShuffleInterval / 1000}s</span>
                    </div>
                    <Slider 
                        value={[colorShuffleInterval]} 
                        min={2000} 
                        max={60000} 
                        step={1000}
                        onValueChange={(vals) => setColorShuffleInterval(vals[0])}
                        name="colorShuffleInterval_slider" // Helper, we'll use hidden input
                    />
                    <input type="hidden" name="colorShuffleInterval" value={colorShuffleInterval} />
                </div>

                {/* Intensity */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium flex items-center gap-2">
                            <Sun className="h-3 w-3" /> Color Intensity
                        </Label>
                        <span className="text-xs text-muted-foreground">{colorIntensity}x</span>
                    </div>
                    <Slider 
                        value={[colorIntensity]} 
                        min={0.1} 
                        max={2} 
                        step={0.1}
                        onValueChange={(vals) => setColorIntensity(vals[0])}
                    />
                    <input type="hidden" name="colorIntensity" value={colorIntensity} />
                </div>

                {/* Opacity */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium flex items-center gap-2">
                            <Volume2 className="h-3 w-3" /> Opacity
                        </Label>
                        <span className="text-xs text-muted-foreground">{Math.round(colorOpacity * 100)}%</span>
                    </div>
                    <Slider 
                        value={[colorOpacity]} 
                        min={0.1} 
                        max={1} 
                        step={0.1}
                        onValueChange={(vals) => setColorOpacity(vals[0])}
                    />
                    <input type="hidden" name="colorOpacity" value={colorOpacity} />
                </div>
            </div>

            {/* Existing Fields: Colors & Gradients */}
            <div className="grid gap-3 md:grid-cols-3">
                <label className="flex flex-col gap-1 text-xs">
                    <span className="text-muted-foreground">Solid color HSL</span>
                    <Input
                        name="solidColor"
                        defaultValue={bg.solidColor ?? ""}
                        placeholder="e.g. 160 40% 15%"
                    />
                </label>

                <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Gradient from</span>
                        <Input
                            name="gradientFrom"
                            defaultValue={bg.gradientFrom ?? ""}
                            placeholder="142 73% 35%"
                        />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Gradient to</span>
                        <Input
                            name="gradientTo"
                            defaultValue={bg.gradientTo ?? ""}
                            placeholder="160 40% 15%"
                        />
                    </label>
                </div>
                
                 <label className="flex flex-col gap-1 text-xs">
                    <span className="text-muted-foreground">Overlay color</span>
                    <Input
                        name="overlayColor"
                        defaultValue={bg.overlayColor ?? ""}
                        placeholder="0 0% 0%"
                    />
                </label>
            </div>

            <div className="grid gap-3 md:grid-cols-3 text-xs">
               <label className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Overlay opacity (0-1)</span>
                    <Input
                        name="overlayOpacity"
                        defaultValue={bg.overlayOpacity?.toString() ?? ""}
                        type="number"
                        min="0"
                        max="1"
                        step="0.05"
                    />
                </label>
                <div className="flex flex-col gap-2 justify-center border p-2 rounded">
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <Switch 
                            name="colorShuffle" 
                            defaultChecked={bg.colorShuffle} 
                        />
                        <span className="font-medium">Shuffle Colors</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <Switch 
                            name="imageShuffle" 
                            defaultChecked={bg.imageShuffle} 
                        />
                        <span className="font-medium">Shuffle Images</span>
                    </label>
                     <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <Switch 
                            name="rotationEnabled" 
                            defaultChecked={bg.rotationEnabled} 
                        />
                        <span className="font-medium">Enable Rotation</span>
                    </label>
                </div>
                <label className="flex flex-col gap-1">
                     <span className="text-muted-foreground">Rotation Interval (s)</span>
                     <Input
                        name="rotationInterval"
                        type="number"
                        min="5"
                        step="1"
                        defaultValue={bg.rotationInterval ?? 10}
                     />
                </label>
            </div>

            {/* Images */}
            <div className="rounded-md bg-blue-50/10 border border-blue-500/20 p-3 text-xs text-blue-400">
                <p className="font-semibold">Note on Images:</p>
                <p>Use direct image links (ending in .jpg, .png, etc).</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 text-xs">
                <ImageInputWithPreview
                    name="image1Url"
                    defaultValue={image1?.url ?? ""}
                    placeholder="https://..."
                    label="Image 1 URL"
                    altName="image1Alt"
                    defaultAlt={image1?.alt ?? ""}
                />
                <ImageInputWithPreview
                    name="image2Url"
                    defaultValue={image2?.url ?? ""}
                    placeholder="https://..."
                    label="Image 2 URL"
                    altName="image2Alt"
                    defaultAlt={image2?.alt ?? ""}
                />
            </div>
        </>
      )}

      <div className="flex justify-end pt-2">
        <Button type="submit">
          Save {bg.pageKey} Background
        </Button>
      </div>
    </form>
  )
}
