"use client"

export default function VideoPlayer({ url, poster }: { url: string; poster?: string }) {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      poster={poster}
      className="absolute inset-0 h-full w-full object-cover"
    >
      <source src={url} type="video/mp4" />
    </video>
  )
}
