"use client"

import { useState, useEffect } from "react"
import { PageBackgroundConfig } from "@/lib/backgrounds"
import { updateUiEffects } from "@/app/actions/ui-effects"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Zap, Monitor, Smartphone, Eye, Shuffle, Palette, Check, Volume2, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"

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

export function UiEffectsControls({ initialConfig }: { initialConfig: PageBackgroundConfig | null }) {
  const [config, setConfig] = useState<Partial<PageBackgroundConfig>>(initialConfig || {
    mode: "gradient",
    enableParallax: true,
    enableGlassmorphism: true,
    enableNeon: false,
    enableAnimations: true,
    animationIntensity: "medium",
    disableMobileEffects: true,
    reduceMotion: false,
    enableModeShuffle: false,
    customColors: [],
    colorShuffleInterval: 5000,
    colorIntensity: 1,
    colorOpacity: 1
  })

  const [isSaving, setIsSaving] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [warnings, setWarnings] = useState<string[]>([])
  
  // Live Preview Dispatch
  useEffect(() => {
    // Debounce to avoid excessive updates
    const timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('ui-effects-update', { detail: config }))
    }, 100)
    return () => clearTimeout(timer)
  }, [config])

  const toggleCustomColor = (colorValue: string) => {
    const current = config.customColors || []
    if (current.includes(colorValue)) {
      setConfig(prev => ({ ...prev, customColors: current.filter(c => c !== colorValue) }))
    } else {
      setConfig(prev => ({ ...prev, customColors: [...current, colorValue] }))
    }
  }

  // Validation
  useEffect(() => {
    const newWarnings: string[] = []
    
    // Video Size Warning
    if (config.mode === "video" && config.videoUrl) {
       // Just a heuristic check for common large file extensions or if user inputs a raw file path
       if (config.videoUrl.endsWith(".mov") || config.videoUrl.endsWith(".avi")) {
         newWarnings.push("Warning: .mov/.avi formats are heavy. Use optimized .mp4 or .webm.")
       }
    }

    // Heavy Effects Warning
    const heavyEffects = [
      config.mode === "video",
      config.mode === "particles",
      config.mode === "webgl",
      config.enableParallax,
      !config.disableMobileEffects
    ].filter(Boolean).length

    if (heavyEffects >= 3) {
      newWarnings.push("Performance Warning: Multiple heavy effects enabled. Consider disabling some for better mobile performance.")
    }

    setWarnings(newWarnings)
  }, [config])

  const handleChange = (key: keyof PageBackgroundConfig, value: string | number | boolean | string[]) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateUiEffects(config)
    } catch (error) {
      console.error("Failed to save settings", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    const defaults: Partial<PageBackgroundConfig> = {
      mode: "gradient",
      enableParallax: true,
      enableGlassmorphism: true,
      enableNeon: false,
      enableAnimations: true,
      animationIntensity: "medium",
      disableMobileEffects: true,
      reduceMotion: false
    }
    setConfig(defaults)
    updateUiEffects(defaults)
  }

  return (
    <Card className="w-full mt-8 scroll-mt-20" id="ui-effects">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Appearance / UI Effects
                </CardTitle>
                <CardDescription>Control global visual effects, performance, and background styles.</CardDescription>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2 border-r border-border pr-4 mr-2">
                    <Switch 
                        checked={config.enableModeShuffle || false}
                        onCheckedChange={(c) => handleChange("enableModeShuffle", c)}
                        id="shuffle-mode"
                    />
                    <Label htmlFor="shuffle-mode" className="text-xs font-medium flex items-center gap-1 cursor-pointer">
                        <Shuffle className="h-3 w-3" /> Shuffle Mode
                    </Label>
                </div>
                <div className="flex items-center space-x-2 border-r border-border pr-4 mr-2">
                   <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Monitor className="h-3 w-3" /> Global Mode
                   </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch 
                        checked={debugMode}
                        onCheckedChange={setDebugMode}
                        id="debug-mode"
                    />
                    <Label htmlFor="debug-mode" className="text-xs text-muted-foreground">Debug</Label>
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* 1. Background Type */}
        <div className="space-y-4">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Background Type
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: "video", label: "Video Background" },
              { id: "gradient", label: "Animated Gradient" },
              { id: "particles", label: "Particle Animation" },
              { id: "waves", label: "Waves (Canvas)" },
              { id: "webgl", label: "WebGL Shader" },
              { id: "solid", label: "Solid Color" },
            ].map((mode) => (
              <Button
                key={mode.id}
                variant={config.mode === mode.id ? "default" : "outline"}
                onClick={() => handleChange("mode", mode.id)}
                className="w-full h-auto py-3 text-sm"
              >
                {mode.label}
              </Button>
            ))}
             <Button
                variant={config.mode === "solid" && !config.solidColor ? "destructive" : "outline"}
                onClick={() => {
                    setConfig(prev => ({ 
                        ...prev, 
                        mode: "solid", 
                        solidColor: undefined, // Transparent/None
                        gradientFrom: undefined, 
                        gradientTo: undefined,
                        enableModeShuffle: false
                    }))
                }}
                className="w-full h-auto py-3 text-sm border-dashed"
              >
                None (Reset)
              </Button>
          </div>
          
          {config.mode === "video" && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/30 space-y-4">
              <div>
                <Label htmlFor="videoUrl">Video URL (MP4/WebM)</Label>
                <Input 
                  id="videoUrl" 
                  value={config.videoUrl || ""} 
                  onChange={(e) => handleChange("videoUrl", e.target.value)}
                  placeholder="https://example.com/background.mp4"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Direct link to video file. Keep under 5MB for best performance.</p>
              </div>
              
              <div>
                <Label htmlFor="fallbackImage">Mobile Fallback Image</Label>
                <Input 
                  id="fallbackImage" 
                  value={config.videoFallbackImage || ""} 
                  onChange={(e) => handleChange("videoFallbackImage", e.target.value)}
                  placeholder="https://example.com/poster.jpg"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Shown on mobile or when &quot;Disable Heavy Effects&quot; is active.</p>
              </div>
            </div>
          )}
        </div>

        {/* 2. Toggle Effects */}
        <div className="space-y-4">
          <Label className="text-base font-semibold flex items-center gap-2">
             <Eye className="h-4 w-4" />
             Visual Effects
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="parallax" 
                checked={config.enableParallax} 
                onCheckedChange={(c) => handleChange("enableParallax", c === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="parallax">Parallax Scroll Effect</Label>
                <p className="text-sm text-muted-foreground">Background moves slightly with mouse/scroll.</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="glass" 
                checked={config.enableGlassmorphism} 
                onCheckedChange={(c) => handleChange("enableGlassmorphism", c === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="glass">Glassmorphism UI</Label>
                <p className="text-sm text-muted-foreground">Add blur and transparency to cards.</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="neon" 
                checked={config.enableNeon} 
                onCheckedChange={(c) => handleChange("enableNeon", c === true)}
              />
               <div className="grid gap-1.5 leading-none">
                <Label htmlFor="neon">Neon / Glow Effects</Label>
                <p className="text-sm text-muted-foreground">Add futuristic glow to borders and active elements.</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="animations" 
                checked={config.enableAnimations} 
                onCheckedChange={(c) => handleChange("enableAnimations", c === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="animations">Global Animations</Label>
                <p className="text-sm text-muted-foreground">Enable transitions and micro-interactions.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Mobile & Performance */}
        <div className="space-y-4">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Performance & Mobile
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="mobile" 
                checked={config.disableMobileEffects} 
                onCheckedChange={(c) => handleChange("disableMobileEffects", c === true)}
              />
               <div className="grid gap-1.5 leading-none">
                <Label htmlFor="mobile">Disable Heavy Effects on Mobile</Label>
                <p className="text-sm text-muted-foreground">Automatically turns off video/canvas on small screens.</p>
              </div>
            </div>
             <div className="flex items-center space-x-2">
              <Checkbox 
                id="motion" 
                checked={config.reduceMotion} 
                onCheckedChange={(c) => handleChange("reduceMotion", c === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="motion">Reduce Motion (Accessibility)</Label>
                <p className="text-sm text-muted-foreground">Minimizes animations for users with vestibular disorders.</p>
              </div>
            </div>
          </div>
          
          <div className="max-w-xs mt-4">
            <Label htmlFor="intensity">Animation Intensity</Label>
            <select 
              id="intensity"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
              value={config.animationIntensity || "medium"}
              onChange={(e) => handleChange("animationIntensity", e.target.value)}
            >
              <option value="low">Low (Minimal)</option>
              <option value="medium">Medium (Balanced)</option>
              <option value="high">High (Showcase)</option>
            </select>
          </div>
        </div>

        {/* 4. Color Palette */}
        <div className="space-y-4">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Color Palette & Shuffle
          </Label>
          
          <div className="p-4 border rounded-lg bg-muted/10 space-y-6">
            
            {/* Controls Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                    <Label className="text-xs font-medium flex items-center gap-2">
                        <Shuffle className="h-3 w-3" /> Shuffle Interval ({config.colorShuffleInterval ? config.colorShuffleInterval / 1000 : 5}s)
                    </Label>
                    <Slider 
                        value={[config.colorShuffleInterval || 5000]} 
                        min={2000} 
                        max={60000} 
                        step={1000}
                        onValueChange={(vals) => handleChange("colorShuffleInterval", vals[0])}
                    />
                </div>
                <div className="space-y-3">
                    <Label className="text-xs font-medium flex items-center gap-2">
                        <Sun className="h-3 w-3" /> Color Intensity ({config.colorIntensity || 1})
                    </Label>
                    <Slider 
                        value={[config.colorIntensity || 1]} 
                        min={0.1} 
                        max={2} 
                        step={0.1}
                        onValueChange={(vals) => handleChange("colorIntensity", vals[0])}
                    />
                </div>
                <div className="space-y-3">
                    <Label className="text-xs font-medium flex items-center gap-2">
                        <Volume2 className="h-3 w-3" /> Opacity ({config.colorOpacity || 1})
                    </Label>
                    <Slider 
                        value={[config.colorOpacity || 1]} 
                        min={0.1} 
                        max={1} 
                        step={0.1}
                        onValueChange={(vals) => handleChange("colorOpacity", vals[0])}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
                <Label className="text-sm font-medium">Preset Colors</Label>
                <span className="text-xs text-muted-foreground">
                    Left Click: Set Main Color • Check: Add to Shuffle
                </span>
            </div>
            
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                {PRESET_COLORS.map((c) => {
                    const isSelected = config.solidColor === c.value || config.gradientFrom === c.value
                    const isInShuffle = config.customColors?.includes(c.value)
                    
                    return (
                        <div key={c.name} className="relative group aspect-square">
                            <button
                                type="button"
                                className={cn(
                                    "w-full h-full rounded-md border shadow-sm transition-all hover:scale-105 focus:ring-2 focus:ring-ring focus:outline-none",
                                    isSelected && "ring-2 ring-primary border-primary"
                                )}
                                style={{ backgroundColor: `hsl(${c.value})` }}
                                onClick={() => {
                                    if (config.mode === "gradient") {
                                        // If gradient, set From and To (slightly lighter)
                                        handleChange("gradientFrom", c.value)
                                        // Simple logic to make gradientTo slightly different or same
                                        handleChange("gradientTo", c.value) 
                                    } else {
                                        handleChange("solidColor", c.value)
                                    }
                                }}
                                title={`${c.name} (Click to set)`}
                            >
                                {isSelected && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Check className="h-4 w-4 text-white drop-shadow-md" />
                                    </div>
                                )}
                            </button>
                            
                            <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background rounded-full shadow-md">
                                <Checkbox 
                                    checked={isInShuffle || false}
                                    onCheckedChange={() => toggleCustomColor(c.value)}
                                    className="h-4 w-4 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                />
                            </div>
                            {isInShuffle && (
                                <div className="absolute -top-1 -right-1 bg-background rounded-full shadow-md">
                                    <Checkbox 
                                        checked={true}
                                        onCheckedChange={() => toggleCustomColor(c.value)}
                                        className="h-4 w-4"
                                    />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
            
            <div className="flex items-center gap-4 pt-2 border-t">
                <div className="flex items-center space-x-2">
                    <Switch 
                        checked={config.colorShuffle || false}
                        onCheckedChange={(c) => handleChange("colorShuffle", c)}
                        id="color-shuffle"
                    />
                    <Label htmlFor="color-shuffle">Enable Color Shuffle</Label>
                </div>
                
                {config.customColors && config.customColors.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                        Cycling through {config.customColors.length} selected colors
                    </span>
                )}
            </div>
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Performance Warning</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc pl-4 space-y-1 mt-1">
                        {warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                </AlertDescription>
            </Alert>
        )}

        {/* 5. Save & Reset */}
        <div className="flex gap-4 pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Global Settings"}
          </Button>
          <Button variant="destructive" onClick={handleReset} disabled={isSaving}>
            Reset to Defaults
          </Button>
        </div>

      </CardContent>
    </Card>
  )
}
