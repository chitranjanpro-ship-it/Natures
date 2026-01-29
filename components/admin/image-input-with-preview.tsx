"use client"

import { useState, useEffect } from "react"

interface Props {
  name: string
  defaultValue?: string
  placeholder?: string
  label?: string
  altName?: string
  defaultAlt?: string
}

export function ImageInputWithPreview({ name, defaultValue = "", placeholder, label, altName, defaultAlt = "" }: Props) {
  const [url, setUrl] = useState(defaultValue)

  // Update local state if prop changes (though usually unlikely in this form flow)
  useEffect(() => {
    setUrl(defaultValue)
  }, [defaultValue])

  return (
    <label className="flex flex-col gap-1">
      {label && <span className="text-muted-foreground">{label}</span>}
      <div className="flex gap-2">
        <input
          name={name}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={placeholder}
          className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {url && (
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded border bg-muted flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              className="h-full w-full object-cover"
              alt="Preview"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement?.classList.add("bg-red-100");
                const span = document.createElement("span");
                span.innerText = "❌";
                span.className = "text-[10px]";
                e.currentTarget.parentElement?.appendChild(span);
              }}
            />
          </div>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground">
        * Must be a direct image link (ends in .jpg, .png, .webp). Webpage URLs won&apos;t work.
      </p>
      {altName && (
        <input
          name={altName}
          defaultValue={defaultAlt}
          placeholder="Alt text"
          className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      )}
    </label>
  )
}
