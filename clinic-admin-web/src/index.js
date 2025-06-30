import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import App from './App'
import store from './store'
import { HospitalProvider } from './views/Usecontext/HospitalContext'

createRoot(document.getElementById('root')).render(

  <Provider store={store}>
    <HospitalProvider >
      <App />
    </HospitalProvider>
  </Provider>,
)
