import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import App from './App'
import './App.css'
import store from './store'
import { GlobalSearchProvider } from './views/Usecontext/GlobalSearchContext'
import { HospitalProvider } from './views/Usecontext/HospitalContext'   // ✅ add this import
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { attachInterceptors } from './Utils/Interceptors'
import './views/Style/toastify.css'

function Root() {
  useEffect(() => {
    const detach = attachInterceptors()
    return () => detach()
  }, [])

  return (
    <Provider store={store}>
      <HospitalProvider> {/* ✅ wrap the app inside HospitalProvider */}
        <GlobalSearchProvider>
          <App />
          <ToastContainer
            position="top-right"       // ✅ fixed typo (was top-rignt)
            limit={3}
            theme="dark"
            toastStyle={{
              backgroundColor: 'var(--color-black)',
              color: 'white',
            }}
          />
        </GlobalSearchProvider>
      </HospitalProvider>
    </Provider>
  )
}

createRoot(document.getElementById('root')).render(<Root />)
