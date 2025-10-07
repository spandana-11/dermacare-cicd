import React, {useState, useEffect} from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import App from './App'
import './App.css'
import store from './store'
import { GlobalSearchProvider } from './views/Usecontext/GlobalSearchContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { attachInterceptors } from './Utils/Interceptors' // <-- interceptor file
import './views/Style/toastify.css'

function Root(){

useEffect(()=>{
  const detach=attachInterceptors()
  return() =>detach()
},[])
return(
  <Provider store={store}>
    <GlobalSearchProvider>
      <App />
      <ToastContainer
      position="top-rignt"
      limit={3}
      theme="dark"
      toastStyle={{
        backgroundColor:'var(--color-black)',
        color:'white',
      }}
      />


    </GlobalSearchProvider>
  </Provider>
)
}
createRoot(document.getElementById('root')).render(<Root/>)
