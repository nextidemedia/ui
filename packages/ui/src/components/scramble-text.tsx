import { useEffect, useRef } from "react"

function ScrambleText({ label }: { label: string }) {
  const visual = useRef<HTMLSpanElement>(null)
  const previous = useRef(label)
  useEffect(() => {
    if (previous.current === label) return
    previous.current = label
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const started = performance.now()
    const timer = window.setInterval(() => {
      const progress = Math.min((performance.now() - started) / 300, 1)
      if (visual.current) {
        visual.current.textContent = Array.from(label)
          .map((character, index) =>
            index < Math.ceil(progress * label.length) || /\s|·/.test(character)
              ? character
              : "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]
          )
          .join("")
      }
      if (progress === 1) window.clearInterval(timer)
    }, 30)
    return () => {
      window.clearInterval(timer)
    }
  }, [label])
  return (
    <>
      <span className="sr-only">{label}</span>
      <span ref={visual} aria-hidden="true">
        {label}
      </span>
    </>
  )
}

export { ScrambleText }
