import { useEffect, useRef, useState } from 'react'

function parseStatValue(value) {
  const match = value.match(/^([\d,]+)(.*)$/)
  if (!match) return { number: 0, suffix: value, decimals: 0 }

  const raw = match[1].replace(/,/g, '')
  const suffix = match[2]
  const number = parseFloat(raw)
  const decimals = raw.includes('.') ? raw.split('.')[1].length : 0

  return { number, suffix, decimals }
}

function formatNumber(num, decimals) {
  const fixed = num.toFixed(decimals)
  const parts = fixed.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

export function useCountUp(value, active, duration = 1800) {
  const [display, setDisplay] = useState('0')
  const frameRef = useRef(null)

  useEffect(() => {
    if (!active) return

    const { number, suffix, decimals } = parseStatValue(value)
    const start = performance.now()

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setDisplay(`${formatNumber(number * eased, decimals)}${suffix}`)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [value, active, duration])

  return display
}

export default useCountUp
