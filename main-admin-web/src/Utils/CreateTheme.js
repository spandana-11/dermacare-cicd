import { createTheme } from 'react-data-table-component'

// Optional: create or override a dark theme if needed
export default createTheme('darkCustom', {
  text: {
    primary: '#ffffff',
    secondary: '#aaaaaa',
  },
  background: {
    default: '#1e1e2f',
  },
  context: {
    background: '#333',
    text: '#FFFFFF',
  },
  divider: {
    default: '#444',
  },
  action: {
    button: 'rgba(255,255,255,0.6)',
    hover: 'rgba(255,255,255,1)',
    disabled: 'rgba(255,255,255,0.3)',
  },
})
