import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function useScrollToHash() {
  const { hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    const id = hash.replace('#', '')
    const scrollToTarget = () => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    requestAnimationFrame(scrollToTarget)
  }, [hash])
}
