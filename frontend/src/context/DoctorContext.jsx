import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getDoctorsData } from '../api'
import {
  doctorSpecialties as fallbackSpecialties,
  doctorsCatalog as fallbackDoctors,
  doctorHighlights as fallbackHighlights,
  doctorVisitSteps as fallbackSteps,
} from '../data/doctorsPageData'

const DoctorContext = createContext(null)

const fallbackData = {
  specialties: fallbackSpecialties,
  doctors: fallbackDoctors,
  highlights: fallbackHighlights,
  visitSteps: fallbackSteps,
  stats: {
    total: fallbackDoctors.length,
    available: fallbackDoctors.filter((doctor) => doctor.available).length,
    averageRating: 4.8,
  },
}

export function DoctorProvider({ children }) {
  const [data, setData] = useState(fallbackData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refreshDoctors = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getDoctorsData()
      setData(response)
      setError(null)
    } catch (err) {
      setError(err.message || 'Unable to load doctors right now.')
      setData(fallbackData)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshDoctors()
  }, [refreshDoctors])

  return <DoctorContext.Provider value={{ ...data, loading, error, refreshDoctors }}>{children}</DoctorContext.Provider>
}

export function useDoctors() {
  const context = useContext(DoctorContext)
  if (!context) throw new Error('useDoctors must be used within DoctorProvider')
  return context
}
