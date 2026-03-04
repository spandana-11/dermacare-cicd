import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const NavigationContext = createContext()

export const NavigationProvider = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [stack, setStack] = useState(['/clinic-management']) // always start with dashboard

  // track every route change
  useEffect(() => {
    if (stack[stack.length - 1] !== location.pathname) {
      setStack((prev) => [...prev, location.pathname])
    }

  }, [location.pathname])

  const push = (path) => {
    setStack((prev) => [...prev, path])
    navigate(path)
  }

  const goBack = () => {
    if (stack.length > 1) {
      const newStack = [...stack]
      newStack.pop() // remove current
      const prev = newStack[newStack.length - 1]
      setStack(newStack)
      navigate(prev)
    } else {
      navigate('/clinic-management') // fallback
    }
  }

  return (
    <NavigationContext.Provider value={{ push, goBack, stack }}>
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigation = () => useContext(NavigationContext)
