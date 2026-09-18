import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { createDepartment, deleteDepartment, getDepartments, updateDepartment } from '../api'

const DepartmentContext = createContext(null)

export function DepartmentProvider({ children }) {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshDepartments = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDepartments()
      setDepartments(data)
      setError('')
    } catch (err) {
      setError(err.message || 'Unable to load departments.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refreshDepartments() }, [refreshDepartments])

  const addDepartment = async (payload) => {
    const created = await createDepartment(payload)
    setDepartments((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)))
    return created
  }

  const saveDepartment = async (id, payload) => {
    const updated = await updateDepartment(id, payload)
    setDepartments((current) => current.map((item) => (item._id || item.id) === (updated._id || updated.id) ? updated : item))
    return updated
  }

  const removeDepartment = async (id) => {
    await deleteDepartment(id)
    setDepartments((current) => current.filter((item) => (item._id || item.id) !== id))
  }

  return <DepartmentContext.Provider value={{ departments, loading, error, refreshDepartments, addDepartment, saveDepartment, removeDepartment }}>{children}</DepartmentContext.Provider>
}

export function useDepartments() {
  const context = useContext(DepartmentContext)
  if (!context) throw new Error('useDepartments must be used within DepartmentProvider')
  return context
}
