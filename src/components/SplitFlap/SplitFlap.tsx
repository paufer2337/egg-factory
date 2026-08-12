import { useEffect, useState, type CSSProperties } from 'react'

export const FLIP_DURATION_MS = 110
export const FLIP_STAGGER_MS = 60

type SplitFlapProps = {
  value: string
  className?: string
  stagger?: boolean
  booting?: boolean
}

export function SplitFlap({ value, className = '', stagger = false, booting = false }: SplitFlapProps) {
  const [displayedValue, setDisplayedValue] = useState(value)
  const isFlipping = displayedValue !== value

  useEffect(() => {
    if (!isFlipping) return
    const duration = FLIP_DURATION_MS + (stagger ? Math.max(0, value.length - 1) * FLIP_STAGGER_MS : 0)
    const timer = window.setTimeout(() => setDisplayedValue(value), duration)
    return () => window.clearTimeout(timer)
  }, [isFlipping, stagger, value])

  return (
    <span className={`split-flap ${className} ${booting ? 'split-flap--booting' : ''}`}>
      <span className="sr-only">{value}</span>
      <span className="split-flap__tiles" aria-hidden="true">
        {[...value].map((character, index) => {
          const outgoing = displayedValue[index] ?? character
          const style = { '--flap-delay': `${stagger ? index * FLIP_STAGGER_MS : 0}ms` } as CSSProperties
          return (
            <span className={`flap-tile ${isFlipping ? 'flap-tile--flipping' : ''}`} style={style} key={`${index}-${character}`}>
              <span className="flap-tile__upper"><span className="flap-tile__glyph">{character}</span></span>
              <span className="flap-tile__lower"><span className="flap-tile__glyph">{character}</span></span>
              <span className="flap-tile__seam" />
              <span className="flap-tile__hinge flap-tile__hinge--left" />
              <span className="flap-tile__hinge flap-tile__hinge--right" />
              <span className="flap-tile__outgoing"><span className="flap-tile__glyph">{outgoing}</span></span>
              <span className="flap-tile__incoming"><span className="flap-tile__glyph">{character}</span></span>
            </span>
          )
        })}
      </span>
    </span>
  )
}
