import React, { useState, useEffect } from 'react'
import { CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilContrast } from '@coreui/icons'

// Theme options
const themeOptions = {
  classic: {
    name: 'Classic',
    bgcolor: '#a5c4d4', // Calm blue
    black: '#7e3a93',   // Brand purple
  },
  elegant: {
    name: 'Elegant',
    bgcolor: '#f5f3fa', // Lavender-tinted white
    black: '#5a2d82',   // Deep violet
  },
  ocean: {
    name: 'Ocean',
    bgcolor: '#dae8ff', // Soft sky blue
    black: '#1b4ca0',   // Navy blue text
  },
  sunset: {
    name: 'Sunset',
    bgcolor: '#fff1e6', // Light peach background
    black: '#b34700',   // Deep warm orange
  },
  forest: {
    name: 'Forest',
    bgcolor: '#e3f2ed', // Misty green
    black: '#2f6658',   // Deep emerald
  },

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
