import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import routes from '../routes'
import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'
import { COLORS } from '../Themes'

const AppBreadcrumb = () => {
  const currentLocation = useLocation().pathname
  const navigate = useNavigate()
  const [dateTime, setDateTime] = useState('')

  // 📅 Update date & time every minute
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      const day = now.getDate()
      const suffix =
        day % 10 === 1 && day !== 11
          ? 'st'
          : day % 10 === 2 && day !== 12
            ? 'nd'
            : day % 10 === 3 && day !== 13
              ? 'rd'
              : 'th'

      const month = now.toLocaleString('en-US', { month: 'short' })
      const year = now.getFullYear().toString().slice(-2)
      const weekday = now.toLocaleString('en-US', { weekday: 'short' })
      const time = now.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })

      setDateTime(`${day}${suffix} ${month}, ${year} (${weekday}), ${time}`)
    }

    updateDateTime()
    const timer = setInterval(updateDateTime, 60000)
    return () => clearInterval(timer)
  }, [])

  // 🔖 Find route name from routes list
  const getRouteName = (pathname, routes) => {
    const currentRoute = routes.find((route) => route.path === pathname)
    return currentRoute ? currentRoute.name : false
  }

  // 🥖 Generate breadcrumbs
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

  // ✅ Show back button only for detail pages
  const showBackButton =
    currentLocation.startsWith('/tab-content/') ||
    currentLocation.startsWith('/tab-inProgress/') ||
    currentLocation.startsWith('/tab-completed-content/')

  return (
    <div
      className="d-flex justify-content-between align-items-center w-100 px-3 py-2"

    >
      {/* 🔙 Left Section: Back Button + Breadcrumb */}
      <div className="d-flex align-items-center gap-3">
        {showBackButton && (
          <button
            className="btn btn-sm btn-outline-primary d-flex align-items-center px-3"
            onClick={() => navigate(-1)}
            style={{
              fontWeight: 600,
              borderRadius: '20px',
              color: COLORS.black,      // <-- make sure text is visible
              backgroundColor: 'transparent', // keep outline look
            }}
          >
            ← Back
          </button>
        )}


        {/* 🥖 Breadcrumb */}
        <CBreadcrumb
          className="my-0"
          style={{
            '--cui-breadcrumb-divider-color': COLORS.black,
            marginBottom: 0,
          }}
        >
          <CBreadcrumbItem
            style={{
              cursor: 'pointer',
              color: COLORS.black,
              fontWeight: 'bold',
            }}
            onClick={() => navigate('/dashboard')}
          >
            Home
          </CBreadcrumbItem>

          {breadcrumbs.map((breadcrumb, index) => (
            <CBreadcrumbItem
              key={index}
              style={{
                color: COLORS.black,
                cursor: breadcrumb.active ? 'default' : 'pointer',
                fontWeight: breadcrumb.active ? 600 : 500,
              }}
              {...(breadcrumb.active
                ? { active: true }
                : { onClick: () => navigate(breadcrumb.pathname) })}
            >
              {breadcrumb.name}
            </CBreadcrumbItem>
          ))}
        </CBreadcrumb>
      </div>

      {/* 📅 Right Section: Date & Time */}
      <div className="text-end">
        <small
          style={{
            fontWeight: 600,
            color: COLORS.black,
            fontSize: '0.9rem',
          }}
        >
          {dateTime}
        </small>
      </div>
    </div>
  )
}

export default React.memo(AppBreadcrumb)
