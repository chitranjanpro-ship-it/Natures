
"use client"

export function PrintButton() {
  return (
    <button 
      className="bg-emerald-700 text-white px-6 py-2 rounded shadow hover:bg-emerald-800 transition-colors"
      onClick={() => window.print()}
    >
      Download / Print Certificate
    </button>
  )
}
