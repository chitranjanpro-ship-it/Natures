"use client"

import { useEffect, useRef } from "react"

export default function WavesCanvas({ color }: { color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    let t = 0
    let animationFrameId: number

    const renderWaves = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = color ? `hsl(${color})` : "rgba(255,255,255,0.3)"
      ctx.lineWidth = 2
      
      for(let i=0; i<5; i++) {
        ctx.beginPath()
        for(let x=0; x<canvas.width; x+=10) {
          const y = canvas.height/2 + Math.sin(x*0.01 + t + i) * 50 + (i*20)
          ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      t += 0.02
      animationFrameId = requestAnimationFrame(renderWaves)
    }
    renderWaves()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", resize)
    }
  }, [color])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
}
