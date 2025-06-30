import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CSpinner, useColorModes } from '@coreui/react';
import './scss/style.scss';
import { HospitalProvider } from './views/Usecontext/HospitalContext';
import { ToastContainer } from 'react-toastify';

// Lazy-loaded components
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));
const Login = React.lazy(() => import('./views/pages/login/Login'));
const Register = React.lazy(() => import('./views/pages/register/Register'));
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'));
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'));

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme');
  const storedTheme = useSelector((state) => state.theme);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get('theme')?.match(/^[A-Za-z0-9\s]+/)?.[0];

    if (theme) {
      setColorMode(theme);
    } else if (!isColorModeSet()) {
      setColorMode(storedTheme);
    }
  }, [storedTheme, isColorModeSet, setColorMode]);

  return (
    <BrowserRouter>
      <Suspense fallback={<CSpinner color="primary" variant="grow" />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/404" element={<Page404 />} />
          <Route path="/500" element={<Page500 />} />
          <Route path="*" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </BrowserRouter>
    
  );
};

export default App;
