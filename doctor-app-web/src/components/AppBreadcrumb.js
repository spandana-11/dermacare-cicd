import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import routes from '../routes'
import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'
import { COLORS } from '../Themes'

const AppBreadcrumb = () => {
  const currentLocation = useLocation().pathname
  const navigate = useNavigate()

  const [dateTime, setDateTime] = useState('')

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

  return (
    <div className="d-flex justify-content-between align-items-center w-100 px-2">
   <CBreadcrumb
  className="my-0"
  style={{
    '--cui-breadcrumb-divider-color': COLORS.black, // "/" black
  }}
>
  <CBreadcrumbItem
    style={{ cursor: 'pointer', color: COLORS.black ,fontWeight:'bold'}}
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


      {/* Date on the right corner */}
      <div className="text-end">
        <small style={{ fontWeight: 600, color: COLORS.black }}>
          {dateTime}
        </small>
      </div>
    </div>
  )
}

export default React.memo(AppBreadcrumb)
