import React, { useState, useEffect } from 'react'
import { CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilContrast } from '@coreui/icons'

// Theme options
const themeOptions = {
  classic: { name: 'Classic', bgcolor: '#a5c4d4ff', black: '#7e3a93' }, // default
  light: { name: 'Light', bgcolor: '#ffffff', black: '#bd2d2dff' },
  neutral: { name: 'Neutral', bgcolor: '#f3f4f7', black: '#333333' },
  ocean: { name: 'Ocean', bgcolor: '#6898c9ff', black: '#1b4ca0ff' },
}

const ThemeSelector = () => {
  const [selectedTheme, setSelectedTheme] = useState('classic')

  // Load saved theme from localStorage on first render
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme')
    if (savedTheme && themeOptions[savedTheme]) {
      applyTheme(savedTheme)
      setSelectedTheme(savedTheme)
    } else {
      applyTheme('classic') // default theme
    }
  }, [])

  const applyTheme = (themeKey) => {
    const theme = themeOptions[themeKey]
    if (!theme) return
    document.documentElement.style.setProperty('--color-bgcolor', theme.bgcolor)
    document.documentElement.style.setProperty('--color-black', theme.black)
  }

  const handleThemeChange = (themeKey) => {
    setSelectedTheme(themeKey)
    applyTheme(themeKey)
    localStorage.setItem('selectedTheme', themeKey) // ✅ Save to localStorage
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle caret={false}>
        <CIcon icon={cilContrast} size="lg" style={{ color: 'var(--color-black)' }} />
      </CDropdownToggle>
      <CDropdownMenu>
        {Object.keys(themeOptions).map((themeKey) => (
          <CDropdownItem
            key={themeKey}
            as="button"
            type="button"
            active={selectedTheme === themeKey}
            onClick={() => handleThemeChange(themeKey)}
          >
            {themeOptions[themeKey].name}
          </CDropdownItem>
        ))}
      </CDropdownMenu>
    </CDropdown>
  )
}

export default ThemeSelector
