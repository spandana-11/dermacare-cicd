import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import routes from '../routes'
import { CBreadcrumb, CBreadcrumbItem, CButton } from '@coreui/react'
import { ArrowLeft } from 'lucide-react'
import { COLORS } from '../Constant/Themes'

const AppBreadcrumb = () => {
  const currentLocation = useLocation().pathname
  const navigate = useNavigate()

  const getRouteName = (pathname, routes) => {
    const currentRoute = routes.find((route) => route.path === pathname)
    return currentRoute ? currentRoute.name : false
  }

  const getBreadcrumbs = (location) => {
    const breadcrumbs = []
    location.split('/').reduce((prev, curr, index, array) => {
      const currentPathname = `${prev}/${curr}`
      const routeName = getRouteName(currentPathname, routes)
      if (routeName) {
        breadcrumbs.push({
          pathname: currentPathname,
          name: routeName,
          active: index + 1 === array.length,
        })
      }
      return currentPathname
    })
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs(currentLocation)

  // ✅ Show Back button for all /employee-management subroutes,
  // but NOT on the main /employee-management page
  const showBackButton =
    currentLocation.startsWith('/employee-management') &&
    currentLocation !== '/employee-management'

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1) // Go to previous page if history exists
    } else {
      navigate('/branch-details') // Fallback route
    }
  }

  return (
    <div
      className="d-flex justify-content-between align-items-center"
      style={{ width: '100%' }}
    >
      {/* Breadcrumb Section */}
      <CBreadcrumb className="my-0 custom-breadcrumb">
        <CBreadcrumbItem href="/">Home</CBreadcrumbItem>
        {breadcrumbs.map((breadcrumb, index) => (
          <CBreadcrumbItem
            style={{ color: 'var(--color-black)' }}
            {...(breadcrumb.active ? { active: true } : { href: breadcrumb.pathname })}
            key={index}
          >
            {breadcrumb.name}
          </CBreadcrumbItem>
        ))}
      </CBreadcrumb>

      {/* ✅ Back Button (only on subpages) */}
      {showBackButton && (
        <CButton
          size="sm"
          style={{
            background: '#fff',
            color: '#00838F',
            border: 'none',
            fontWeight: '600',
            borderRadius: '8px',
            padding: '6px 14px',
          }}
          onClick={handleBack}
        >

          Back
        </CButton>
      )}
    </div>
  )
}

export default React.memo(AppBreadcrumb)
