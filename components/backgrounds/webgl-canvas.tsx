"use client"

import { useEffect, useRef } from "react"

export default function WebGLCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl")
    if (!gl) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener("resize", resize)
    
    // Simple shader setup
    const vertexSrc = `attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }`
    const fragmentSrc = `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_resolution;
        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution;
            float t = u_time * 0.2;
            float r = 0.5 + 0.5 * sin(6.2831*(st.x+st.y) + t*3.0);
            float g = 0.5 + 0.5 * sin(6.2831*(st.x*0.7-st.y*0.4) + t*2.0);
            float b = 0.5 + 0.5 * sin(6.2831*(st.y) + t*4.0);
            gl_FragColor = vec4(r, g, b, 1.0);
        }
    `
    
    const createShader = (type: number, src: string) => {
        const s = gl.createShader(type)
        if(!s) return null
        gl.shaderSource(s, src)
        gl.compileShader(s)
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null }
        return s
    }
    
    const vs = createShader(gl.VERTEX_SHADER, vertexSrc)
    const fs = createShader(gl.FRAGMENT_SHADER, fragmentSrc)
    
    let animationFrameId: number

    if (vs && fs) {
        const program = gl.createProgram()
        if (program) {
            gl.attachShader(program, vs)
            gl.attachShader(program, fs)
            gl.linkProgram(program)
            if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
                gl.useProgram(program)
                const posLoc = gl.getAttribLocation(program, "position")
                const timeLoc = gl.getUniformLocation(program, "u_time")
                const resLoc = gl.getUniformLocation(program, "u_resolution")
                
                const buffer = gl.createBuffer()
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW)
                gl.enableVertexAttribArray(posLoc)
                gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)
                
                const start = performance.now()
                const renderGL = () => {
                    const t = (performance.now() - start) / 1000
                    gl.uniform1f(timeLoc, t)
                    gl.uniform2f(resLoc, canvas.width, canvas.height)
                    gl.drawArrays(gl.TRIANGLES, 0, 3)
                    animationFrameId = requestAnimationFrame(renderGL)
                }
                renderGL()
            }
        }
    }

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
}
