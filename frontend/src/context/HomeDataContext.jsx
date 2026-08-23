import { createContext, useContext, useEffect, useState } from 'react'
import { getHomeData } from '../api'
import seedData from '../data/fallbackHomeData'

const HomeDataContext = createContext(null)

export function HomeDataProvider({ children }) {
  const [data, setData] = useState(seedData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    getHomeData()
      .then((homeData) => {
        if (active) {
          setData(homeData)
          setError(null)
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message)
          setData(seedData)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <HomeDataContext.Provider value={{ data, loading, error }}>
      {children}
    </HomeDataContext.Provider>
  )
}

export function useHomeData() {
  const context = useContext(HomeDataContext)
  if (!context) {
    throw new Error('useHomeData must be used within HomeDataProvider')
  }
  return context
}
