"use client"
import { useEffect, useMemo, useState } from "react"
import type { PageBackgroundConfig } from "@/lib/backgrounds"
import dynamic from "next/dynamic"

// Dynamic Imports for Heavy Effects
const ParticlesCanvas = dynamic(() => import("@/components/backgrounds/particles-canvas"), { ssr: false })
const WavesCanvas = dynamic(() => import("@/components/backgrounds/waves-canvas"), { ssr: false })
const WebGLCanvas = dynamic(() => import("@/components/backgrounds/webgl-canvas"), { ssr: false })
const VideoPlayer = dynamic(() => import("@/components/backgrounds/video-player"), { ssr: false })

type Props = {
	config: PageBackgroundConfig | null
	pageKey: string
}

type PointerState = { x: number; y: number }

export function PageBackground({ config: initialConfig, pageKey }: Props) {
	// Live Preview State
	const [config, setConfig] = useState<PageBackgroundConfig | null>(initialConfig)
	const [shuffledMode, setShuffledMode] = useState<PageBackgroundConfig["mode"] | null>(null)
	const [shuffledColor, setShuffledColor] = useState<string | null>(null)

	useEffect(() => {
		setConfig(initialConfig)
	}, [initialConfig])

	useEffect(() => {
		// Listen for live preview updates from Admin Panel
		const handlePreview = (e: Event) => {
			const customEvent = e as CustomEvent<PageBackgroundConfig>
			console.log("Live Preview Update:", customEvent.detail)
			setConfig(prev => ({ ...prev, ...customEvent.detail }))
		}
		window.addEventListener("ui-effects-update", handlePreview)
		return () => window.removeEventListener("ui-effects-update", handlePreview)
	}, [])

	// Mode Shuffle Logic
	useEffect(() => {
		if (!config?.enableModeShuffle) {
			setShuffledMode(null)
			return
		}
		
		const modes: PageBackgroundConfig["mode"][] = ["gradient", "particles", "waves", "webgl", "mesh", "aurora", "animated"]
		
		const id = setInterval(() => {
			const randomMode = modes[Math.floor(Math.random() * modes.length)]
			setShuffledMode(randomMode)
		}, 15000) // Change every 15 seconds
		
		return () => clearInterval(id)
	}, [config?.enableModeShuffle])

	const effectiveConfig = useMemo(() => {
		if (shuffledMode && config) {
			return { ...config, mode: shuffledMode }
		}
		return config
	}, [config, shuffledMode])

	const [index, setIndex] = useState(0)
	const [pointer, setPointer] = useState<PointerState>({ x: 0, y: 0 })
	const [hueRotation, setHueRotation] = useState(0)
	const [rotationAngle, setRotationAngle] = useState(0)
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 768)
		checkMobile()
		window.addEventListener("resize", checkMobile)
		return () => window.removeEventListener("resize", checkMobile)
	}, [])

	const shouldDisableHeavyEffects = effectiveConfig?.disableMobileEffects && isMobile
	const parallaxEnabled = effectiveConfig?.enableParallax && !shouldDisableHeavyEffects && !effectiveConfig?.reduceMotion

	const images = useMemo(() => effectiveConfig?.images ?? [], [effectiveConfig])

	// Rotation Logic (Slideshow & Gradient)
	useEffect(() => {
		if (!effectiveConfig?.rotationEnabled || shouldDisableHeavyEffects) return
		
		const isImageMode = effectiveConfig.mode === "image" || effectiveConfig.mode === "mixed"
		if (isImageMode && images.length <= 1) return

		const intervalMs = (effectiveConfig.rotationInterval ?? 10) * 1000
		
		const id = setInterval(() => {
			if (effectiveConfig.imageShuffle) {
				setIndex(prev => {
					let next = Math.floor(Math.random() * images.length)
					if (next === prev && images.length > 1) {
						next = (next + 1) % images.length
					}
					return next
				})
			} else {
				setIndex((prev) => (prev + 1) % images.length)
			}
			setRotationAngle(prev => (prev + 45) % 360)
		}, intervalMs)
		
		return () => clearInterval(id)
	}, [effectiveConfig?.rotationEnabled, effectiveConfig?.imageShuffle, effectiveConfig?.rotationInterval, effectiveConfig?.mode, images.length, pageKey, shouldDisableHeavyEffects])

	// Color Shuffle Logic
	useEffect(() => {
		if (!effectiveConfig?.colorShuffle) {
			setShuffledColor(null)
			setHueRotation(0)
			return
		}

		if (effectiveConfig.customColors && effectiveConfig.customColors.length > 0) {
			const colors = effectiveConfig.customColors
			const interval = effectiveConfig.colorShuffleInterval || 5000
			
			const id = setInterval(() => {
				const nextColor = colors[Math.floor(Math.random() * colors.length)]
				setShuffledColor(nextColor)
			}, interval)
			// Initial set
			if (!shuffledColor) setShuffledColor(colors[Math.floor(Math.random() * colors.length)])
			
			return () => clearInterval(id)
		} else {
			const interval = effectiveConfig.colorShuffleInterval || 5000
			const id = setInterval(() => {
				setHueRotation(prev => (prev + 45) % 360)
			}, interval)
			return () => clearInterval(id)
		}
	}, [effectiveConfig?.colorShuffle, effectiveConfig?.customColors, effectiveConfig?.colorShuffleInterval, shuffledColor])

	// Mouse Parallax
	useEffect(() => {
		if (!effectiveConfig || !parallaxEnabled) return
		function handlePointerMove(e: PointerEvent) {
			if (!window.innerWidth || !window.innerHeight) return
			const nx = e.clientX / window.innerWidth - 0.5
			const ny = e.clientY / window.innerHeight - 0.5
			setPointer({ x: nx, y: ny })
		}
		window.addEventListener("pointermove", handlePointerMove)
		return () => window.removeEventListener("pointermove", handlePointerMove)
	}, [effectiveConfig, parallaxEnabled])

	const backgroundStyle = useMemo(() => {
		if (!effectiveConfig) return {}
		
		const activeSolidColor = shuffledColor || effectiveConfig.solidColor
		const activeGradientFrom = shuffledColor || effectiveConfig.gradientFrom
		const activeGradientTo = shuffledColor || effectiveConfig.gradientTo

		const baseStyle: React.CSSProperties = {
			filter: (effectiveConfig.colorShuffle && !shuffledColor) ? `hue-rotate(${hueRotation}deg)` : undefined,
			transition: "filter 5s ease-in-out, background-image 1s ease-in-out, background-color 1s ease-in-out",
			opacity: effectiveConfig.colorOpacity ?? 1,
		}

		if (effectiveConfig.colorIntensity && effectiveConfig.colorIntensity !== 1) {
			baseStyle.filter = baseStyle.filter 
				? `${baseStyle.filter} saturate(${effectiveConfig.colorIntensity})` 
				: `saturate(${effectiveConfig.colorIntensity})`
		}

		if (effectiveConfig.mode === "webgl" || effectiveConfig.mode === "particles" || effectiveConfig.mode === "waves") {
			return { ...baseStyle, backgroundColor: activeSolidColor ? `hsl(${activeSolidColor})` : "#000" }
		}

		const overlay = effectiveConfig.overlayColor && effectiveConfig.overlayOpacity != null
			? `linear-gradient(rgba(${effectiveConfig.overlayColor} / ${effectiveConfig.overlayOpacity}), rgba(${effectiveConfig.overlayColor} / ${effectiveConfig.overlayOpacity}))`
			: undefined

		if (effectiveConfig.mode === "solid") {
			if (activeSolidColor) {
				return { ...baseStyle, backgroundColor: `hsl(${activeSolidColor})` }
			}
			return baseStyle
		}

		// Fallback for video mode on mobile
		if (effectiveConfig.mode === "video" && shouldDisableHeavyEffects && effectiveConfig.videoFallbackImage) {
			return {
				...baseStyle,
				backgroundImage: `url(${effectiveConfig.videoFallbackImage})`,
				backgroundSize: "cover",
				backgroundPosition: "center"
			}
		}

		if (effectiveConfig.mode === "mesh") {
			const c1 = activeGradientFrom ? `hsl(${activeGradientFrom})` : "rgba(255,0,0,0.5)"
			const c2 = activeGradientTo ? `hsl(${activeGradientTo})` : "rgba(0,0,255,0.5)"
			return {
				...baseStyle,
				backgroundImage: `
					radial-gradient(at 0% 0%, ${c1} 0px, transparent 50%),
					radial-gradient(at 100% 0%, ${c2} 0px, transparent 50%),
					radial-gradient(at 100% 100%, ${c1} 0px, transparent 50%),
					radial-gradient(at 0% 100%, ${c2} 0px, transparent 50%)
				`,
				backgroundSize: "150% 150%",
				animation: "mesh-move 10s ease infinite alternate"
			}
		}

		if (effectiveConfig.mode === "gradient" || effectiveConfig.mode === "aurora" || effectiveConfig.mode === "animated") {
			if (activeGradientFrom && activeGradientTo) {
				const angle = effectiveConfig.rotationEnabled ? rotationAngle : 135
				return { 
					...baseStyle,
					backgroundImage: `linear-gradient(${angle}deg, hsl(${activeGradientFrom}), hsl(${activeGradientTo}))` 
				}
			}
		}

		if ((effectiveConfig.mode === "image" || effectiveConfig.mode === "mixed")) {
			if (images.length > 0) {
				const current = images[index] ?? images[0]
				const imageLayer = `url(${current.url})`
				const layers = overlay ? `${overlay}, ${imageLayer}` : imageLayer
				
				const style: React.CSSProperties = {
					...baseStyle,
					backgroundImage: layers,
					backgroundSize: "cover",
					backgroundPosition: "center",
					backgroundAttachment: "fixed"
				}

				if (effectiveConfig.mode === "mixed" && activeSolidColor) {
					style.backgroundColor = `hsl(${activeSolidColor})`
					style.backgroundBlendMode = "overlay"
				}
				
				return style
			} else {
				if (effectiveConfig.mode === "mixed" && activeSolidColor) {
					return { ...baseStyle, backgroundColor: `hsl(${activeSolidColor})` }
				}
			}
		}

		return baseStyle
	}, [effectiveConfig, images, index, hueRotation, rotationAngle, shuffledColor, shouldDisableHeavyEffects])

	const parallaxStyle = useMemo(() => {
		if (!effectiveConfig || !parallaxEnabled) return {}
		const strength = effectiveConfig.mode === "image" || effectiveConfig.mode === "mixed" ? 18 : 10
		const tx = pointer.x * strength
		const ty = pointer.y * strength
		return {
			transform: `translate3d(${tx}px, ${ty}px, 0)` ,
		}
	}, [effectiveConfig, pointer, parallaxEnabled])

	const combinedStyle = {
		...backgroundStyle,
		...parallaxStyle,
	}

	const animatedClass = (!effectiveConfig?.reduceMotion && effectiveConfig?.enableAnimations && (effectiveConfig?.mode === "gradient" || effectiveConfig?.mode === "aurora" || effectiveConfig?.mode === "animated")) ? "bg-animated-gradient" : ""

	const activeSolidColor = shuffledColor || effectiveConfig?.solidColor

	// OVERRIDE LOGIC:
	// If a specific "Heavy" mode is selected (Video, Particles, etc.), we render it regardless of the theme.
	// Only if the mode is "Standard" (gradient, solid, image) do we respect the Theme's wish to hide the background (for Neo-Brutalism/Luxury).
	const isSpecialMode = ["video", "particles", "waves", "webgl", "mesh", "aurora"].includes(effectiveConfig?.mode || "")
	
	if (!isSpecialMode && (effectiveConfig?.uiTheme === "neo-brutalism" || effectiveConfig?.uiTheme === "luxury" || effectiveConfig?.uiTheme === "glassmorphism")) {
		return null
	}

	return (
		<div
			aria-hidden="true"
			className={`pointer-events-none fixed inset-0 -z-10 opacity-90 transition-[background-image] duration-700 will-change-auto ${animatedClass}`}
			style={combinedStyle}
		>
			{effectiveConfig?.mode === "video" && effectiveConfig.videoUrl && !shouldDisableHeavyEffects && (
				<VideoPlayer url={effectiveConfig.videoUrl} poster={effectiveConfig.videoFallbackImage} />
			)}

			{effectiveConfig?.mode === "aurora" && (
				<>
					<div className="aurora-blob aurora-blob-1" />
					<div className="aurora-blob aurora-blob-2" />
					<div className="aurora-blob aurora-blob-3" />
				</>
			)}
			
			{!shouldDisableHeavyEffects && (
				<>
					{effectiveConfig?.mode === "webgl" && <WebGLCanvas />}
					{effectiveConfig?.mode === "particles" && <ParticlesCanvas color={activeSolidColor} />}
					{effectiveConfig?.mode === "waves" && <WavesCanvas color={activeSolidColor} />}
				</>
			)}
			
			<style jsx global>{`
				@keyframes mesh-move {
					0% { background-position: 0% 0%; }
					100% { background-position: 100% 100%; }
				}
			`}</style>
		</div>
	)
}
