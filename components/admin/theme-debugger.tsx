"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "@/components/theme-provider"

// Helper to parse HSL/RGB and calculate luminance
function getLuminance(r: number, g: number, b: number) {
  const a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

// Convert HSL string (e.g., "222 47% 11%") to RGB
function hslToRgb(h: number, s: number, l: number) {
  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))]
}

function getContrastRatio(fg: string, bg: string) {
    // Basic HSL parsing assuming "H S% L%" format from Tailwind vars
    const parse = (c: string) => {
        const parts = c.split(" ").map(p => parseFloat(p))
        if (parts.length === 3) return hslToRgb(parts[0], parts[1], parts[2])
        return [0, 0, 0] // Fallback
    }

    const rgb1 = parse(fg)
    const rgb2 = parse(bg)
    
    const l1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]) + 0.05
    const l2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]) + 0.05
    
    return l1 > l2 ? l1 / l2 : l2 / l1
}

export function ThemeDebugger() {
    const { theme } = useTheme()
    const [metrics, setMetrics] = useState<any[]>([])

    useEffect(() => {
        // Wait for theme application
        setTimeout(() => {
            const root = document.documentElement
            const style = getComputedStyle(root)
            
            const pairs = [
                { name: "Background / Foreground", bg: "--background", fg: "--foreground" },
                { name: "Card / Card Foreground", bg: "--card", fg: "--card-foreground" },
                { name: "Primary / Primary Foreground", bg: "--primary", fg: "--primary-foreground" },
                { name: "Destructive / Destructive Foreground", bg: "--destructive", fg: "--destructive-foreground" },
            ]
            
            const results = pairs.map(p => {
                const bgVal = style.getPropertyValue(p.bg).trim()
                const fgVal = style.getPropertyValue(p.fg).trim()
                const ratio = getContrastRatio(fgVal, bgVal)
                return { ...p, ratio: ratio.toFixed(2), bgVal, fgVal }
            })
            
            setMetrics(results)
        }, 500)
    }, [theme])

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Theme Validation Metrics (WCAG)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                    {metrics.map((m, i) => (
                        <div key={i} className="flex flex-col gap-2 p-4 border rounded bg-muted/20">
                            <span className="font-semibold">{m.name}</span>
                            <div className="flex justify-between items-center">
                                <span className="text-2xl font-bold">{m.ratio}:1</span>
                                <div className="flex gap-2 text-xs">
                                    <span className={Number(m.ratio) >= 4.5 ? "text-green-500 font-bold" : "text-red-500"}>
                                        AA {Number(m.ratio) >= 4.5 ? "PASS" : "FAIL"}
                                    </span>
                                    <span className={Number(m.ratio) >= 7 ? "text-green-500 font-bold" : "text-yellow-500"}>
                                        AAA {Number(m.ratio) >= 7 ? "PASS" : "FAIL"}
                                    </span>
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                                {m.bg}: {m.bgVal} <br/>
                                {m.fg}: {m.fgVal}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
