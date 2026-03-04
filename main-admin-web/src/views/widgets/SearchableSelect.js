import React, { useState, useRef, useEffect } from 'react'

export default function SearchableSelect({
  value,
  onChange,
  options,
  disabledOptions = [],
  placeholder = 'Select Procedure',
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapperRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = options.filter((x) => x.label.toLowerCase().includes(search.toLowerCase()))

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      {/* SELECT BOX */}
      <div
        className="dropdown-select-box"
        onClick={() => setOpen(!open)}
        style={{
          border: '1px solid #ccc',
          padding: '10px 12px',
          borderRadius: '8px',
          background: '#fff',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {options.find((o) => o.value === value)?.label || (
          <span style={{ color: '#999' }}>{placeholder}</span>
        )}

        <span style={{ fontSize: '10px', opacity: 0.7 }}>▼</span>
      </div>

      {/* DROPDOWN MENU */}
      {open && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #ddd',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            marginTop: '6px',
            zIndex: 999,
            maxHeight: '230px',
            overflowY: 'auto',
          }}
        >
          {/* Hidden Search Input (inside dropdown) */}
          <input
            type="text"
            autoFocus
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '10px',
              width: '100%',
              border: '1px solid var(--color-black)',
              borderBottom: '1px solid #eee',
              outline: 'none',
              fontSize: '14px',
            }}
          />

          {/* OPTIONS */}
          {filtered.length > 0 ? (
            filtered.map((opt) => {
              const isDisabled = disabledOptions.includes(opt.value)

              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    if (isDisabled) return
                    onChange(opt.value)
                    setOpen(false)
                    setSearch('')
                  }}
                  style={{
                    padding: '10px 12px',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    background: isDisabled ? '#ffe6e6' : 'white',
                    color: isDisabled ? '#b00000' : '#333',
                    opacity: isDisabled ? 0.7 : 1,
                    borderBottom: '1px solid #f1f1f1',
                  }}
                >
                  {opt.label}
                </div>
              )
            })
          ) : (
            <div style={{ padding: '10px', color: '#999', textAlign: 'center' }}>
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  )
}
