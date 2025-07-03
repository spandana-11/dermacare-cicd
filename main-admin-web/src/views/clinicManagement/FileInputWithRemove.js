import React, { useRef } from 'react'
import { CFormInput } from '@coreui/react'
import { FaTimes } from 'react-icons/fa'

const FileInputWithRemove = ({ name, file, error, onChange, onRemove, accept, invalid }) => {
  const inputRef = useRef()

  const handleRemove = () => {
    // Clear the input field itself
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    // Clear from form state
    onRemove(name)
  }

  return (
    <>
      {!file ? (
        <CFormInput
          type="file"
          name={name}
          onChange={onChange}
          accept={accept}
          invalid={invalid}
          ref={inputRef}
        />
      ) : (
        <div className="d-flex align-items-center border rounded px-2 py-1">
          <span className="me-auto text-truncate" style={{ maxWidth: '85%' }}>
            {typeof file === 'string'
              ? file.split('/').pop() // For URLs or ObjectIDs from backend
              : file?.name || 'No file selected'}
          </span>

          <button
            type="button"
            className="btn btn-sm btn-link text-danger p-0 ms-2"
            onClick={handleRemove}
          >
            <FaTimes />
          </button>
        </div>
      )}
    </>
  )
}

export default FileInputWithRemove
