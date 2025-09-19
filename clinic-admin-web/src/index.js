import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import App from './App'
import './App.css'
import store from './store'
import { HospitalProvider } from './views/Usecontext/HospitalContext'
import { GlobalSearchProvider } from './views/Usecontext/GlobalSearchContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { attachInterceptors } from './Utils/Interceptors' // <-- interceptor file
import './views/Style/toastify.css'
function Root() {
  // attach interceptors once when app mounts
  // useEffect(() => {
  //   const detach = attachInterceptors(() => localStorage.getItem('token'))
  //   return () => detach()
  // }, [])
  useEffect(() => {
    const detach = attachInterceptors()
    return () => detach()
  }, [])

  return (
    <Provider store={store}>
      <GlobalSearchProvider>
        <HospitalProvider>
          <App />
          {/* ✅ Toast container globally */}
          <ToastContainer
            position="top-right"
            limit={3}
            theme="dark" // base dark theme
            toastStyle={{
              backgroundColor: 'var(--color-black)',
              color: 'white',
            }}
          />
        </HospitalProvider>
      </GlobalSearchProvider>
    </Provider>
  )
}

createRoot(document.getElementById('root')).render(<Root />)
